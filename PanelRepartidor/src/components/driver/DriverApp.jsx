import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderList } from '../orders/OrderList';
import { DriverProfile } from './DriverProfile';
import { DriverWallet } from './DriverWallet';
import { DriverSettings } from './DriverSettings';
import { HomeView } from './HomeView';
import { OrdersView } from './OrdersView';
import { MyOrdersView } from './MyOrdersView';
import { BottomNavigation } from './BottomNavigation';
import { DriverHeader } from './DriverHeader';
import { SupportChat } from '../support/SupportChat';
import { Modal } from '../common/Modal';
import { useUnreadSupportMessages } from '../../hooks/useUnreadSupportMessages';
import { supabase } from '../../utils/supabase';
import { getStorageObject } from '../../utils/storage';
import { Package, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';
import '../../styles/Components/DriverApp.css';
import { validateOrderForTransition } from '../orders/orderStateMachine.jsx';

const PROXIMITY_RADIUS_KM = 5; // Radio de proximidad en kilómetros

export function DriverApp({ 
	orders, 
	setOrders, 
	onReloadOrders, 
	activeView, 
	onViewChange, 
	hasLocation, 
	locationLoading,
	isOnline,
	onOnlineChange,
	onLogout,
	driverName,
	currentDriver
}) {
	const [activeTab, setActiveTab] = useState('available');
	const [driverData, setDriverData] = useState(null);
	const [showOrdersModal, setShowOrdersModal] = useState(false);
	const [showSupport, setShowSupport] = useState(false);
	
	// Mensajes no leídos de soporte
	const { unreadCount, clearUnreadCount } = useUnreadSupportMessages(currentDriver);
	
	// Debug: Log del contador
	useEffect(() => {
		console.log('🔔 Contador de mensajes no leídos (driver):', unreadCount);
	}, [unreadCount]);

	// Limpiar contador cuando se abre el chat
	const handleOpenSupport = () => {
		setShowSupport(true);
		clearUnreadCount();
	};

	// Cargar información del driver desde storage (async)
	useEffect(() => {
		const loadDriverData = async () => {
			const data = await getStorageObject('driver');
			setDriverData(data || {});
		};
		loadDriverData();
	}, []);

	// Detectar si se abrió desde la burbuja flotante (Android)
	useEffect(() => {
		// Verificar parámetros de URL
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('showOrdersModal') === 'true') {
			setShowOrdersModal(true);
			// Limpiar el parámetro de la URL
			window.history.replaceState({}, document.title, window.location.pathname);
		}

		// Exponer función global para que MainActivity pueda llamarla
		window.setShowOrdersModal = (show) => {
			setShowOrdersModal(show);
		};

		// Limpiar función global al desmontar
		return () => {
			delete window.setShowOrdersModal;
		};
	}, []);

	const driverId = driverData?.id;
	const finalDriverName = driverName || driverData?.name || 'Repartidor';

	// ---- Listas derivadas ----
	const availableOrders = orders.filter(order => order.status === 'Pendiente');

	const myOrders = orders.filter(
		order => order.driverId === driverId && order.status !== 'Entregado'
	);

	const completedOrders = orders.filter(
		order => order.driverId === driverId && order.status === 'Entregado'
	);

	// ---- Aceptar pedido ----
	const handleAcceptOrder = async (orderId) => {
		const order = orders.find(order => order.id === orderId);
		if (!order) return;

		try {
			const { error } = await supabase
				.from('orders')
				.update({
					status: 'Asignado',
					driver_id: driverId,
				})
				.eq('id', order._dbId);

			if (error) throw error;

			await supabase
				.from('order_status_history')
				.insert({
					order_id: order._dbId,
					status: 'Asignado',
					driver_id: driverId,
				});

			// ✅ Con realtime no necesitas polling.
			// Igual recargamos por seguridad UX (por si realtime tarda o está apagado)
			if (onReloadOrders) {
				await onReloadOrders();
			}

			setActiveTab('myOrders');
			toast.success('Pedido aceptado exitosamente');
		} catch (err) {
			toast.error('Error al aceptar pedido: ' + err.message);
		}
	};

	// ---- Actualizar estado (con máquina de estados) ----
	const handleUpdateStatus = async (orderId, newStatus) => {
		const order = orders.find(o => o.id === orderId);
		if (!order) return;

		// ✅ Validación con máquina de estados ANTES de tocar Supabase
		const check = validateOrderForTransition(order, newStatus);
		if (!check.ok) {
			toast.error(check.reason);
			return;
		}

		try {
			const { error } = await supabase
				.from('orders')
				.update({ status: newStatus })
				.eq('id', order._dbId);

			if (error) throw error;

			await supabase
				.from('order_status_history')
				.insert({
					order_id: order._dbId,
					status: newStatus,
					driver_id: driverId,
				});

			if (onReloadOrders) {
				await onReloadOrders();
			}
			toast.success('Estado actualizado exitosamente');
		} catch (err) {
			toast.error('Error al actualizar estado: ' + err.message);
		}
	};

	/**
	 * ✅ IMPORTANTE: quitamos el polling (antes lo tenías a 1 segundo)
	 * Con realtime, esto NO VA.
	 * (Si en algún momento quieres fallback, se hace cada 30-60s, no cada 1s)
	 */

	// ---- Auto-revert de pedidos "Asignado" por timeout (más liviano) ----
	// Nota profesional: esto idealmente va en servidor (trigger/cron), pero te lo dejo optimizado en cliente.
	const revertingRef = useRef(false);

	useEffect(() => {
		if (!orders?.length) return;

		const interval = setInterval(async () => {
			if (revertingRef.current) return;
			revertingRef.current = true;

			try {
				const now = Date.now();
				const oneMinuteAgo = now - 60_000;

				const ordersToRevert = orders.filter(order => {
					if (order.status !== 'Asignado') return false;
					const updated = new Date(order.updatedAt).getTime();
					return Number.isFinite(updated) && updated < oneMinuteAgo;
				});

				if (ordersToRevert.length === 0) return;

				for (const order of ordersToRevert) {
					try {
						await supabase
							.from('orders')
							.update({
								status: 'Pendiente',
								driver_id: null,
							})
							.eq('id', order._dbId);

						await supabase
							.from('order_status_history')
							.insert({
								order_id: order._dbId,
								status: 'Pendiente',
								driver_id: null,
								notes: 'Revertido automáticamente por timeout',
							});
					} catch (err) {
						logger.error('Error revirtiendo pedido:', err);
					}
				}

				// Si hay pedidos revertidos, cambiar a tab de disponibles
				if (ordersToRevert.length > 0) {
					setActiveTab('available');
				}

				// Refrescar (realtime lo traerá, pero por UX hacemos reload)
				if (onReloadOrders) {
					await onReloadOrders();
				}
			} finally {
				revertingRef.current = false;
			}
		}, 15_000); // ✅ antes era cada 1s (pesadísimo). Ahora 15s.

		return () => clearInterval(interval);
	}, [orders, onReloadOrders]);

	// Los repartidores no pueden eliminar pedidos
	const handleDeleteOrder = undefined;

	// Navegación desde HomeView
	const handleNavigate = (view) => {
		if (view === 'orders') {
			onViewChange('orders');
			setActiveTab('available');
		} else if (view === 'myOrders') {
			onViewChange('myOrders');
			setActiveTab('myOrders');
		} else if (view === 'completed') {
			onViewChange('completed');
		}
	};

	// Manejar cambio de tab desde bottom navigation
	const handleTabChange = (tab) => {
		if (tab === 'orders') {
			onViewChange('orders');
			setActiveTab('available');
		} else if (tab === 'myOrders') {
			onViewChange('orders');
			setActiveTab('myOrders');
		} else {
			onViewChange(tab);
		}
	};

	// Determinar qué mostrar según la vista activa
	const getCurrentView = () => {
		if (activeView === 'orders' && activeTab === 'myOrders') {
			return 'myOrders';
		}
		return activeView;
	};

	return (
		<div 
			className="driver-app-new"
			style={{
				background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
				minHeight: '100vh',
				paddingTop: '4.5rem',
				paddingBottom: '6rem',
				transition: 'background 0.3s ease',
			}}
		>
			{/* Header fijo */}
			<DriverHeader
				isConnected={isOnline}
				onToggleConnection={() => onOnlineChange && onOnlineChange(!isOnline)}
				driverName={finalDriverName}
				hasActiveOrders={myOrders.length > 0}
				onLogout={onLogout}
				onSupportClick={handleOpenSupport}
				unreadSupportCount={unreadCount}
			/>

			{/* Contenido principal */}
			<main style={{ minHeight: 'calc(100vh - 6rem - 4.5rem)' }}>
				<motion.div
					key={activeView}
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.2 }}
				>
					{activeView === 'home' && (
						<HomeView
							userName={finalDriverName}
							isConnected={isOnline}
							onToggleConnection={() => onOnlineChange && onOnlineChange(!isOnline)}
							onNavigate={handleNavigate}
							availableCount={isOnline ? availableOrders.length : 0}
							myOrdersCount={myOrders.length}
							completedCount={completedOrders.length}
						/>
					)}

					{activeView === 'orders' && (
						activeTab === 'available' ? (
							<OrdersView
								orders={isOnline ? availableOrders : []}
								onSelectOrder={undefined}
								onAcceptOrder={handleAcceptOrder}
								onUpdateStatus={handleUpdateStatus}
								isOnline={isOnline}
								hasLocation={hasLocation}
								locationLoading={locationLoading}
								activeTab={activeTab}
								onTabChange={setActiveTab}
							/>
						) : (
							<>
								<div className="orders-view-tabs">
									<button
										onClick={() => setActiveTab('available')}
										className={`orders-view-tab ${activeTab === 'available' ? 'orders-view-tab-active' : ''}`}
									>
										Pedidos Disponibles ({availableOrders.length})
									</button>
									<button
										onClick={() => setActiveTab('myOrders')}
										className={`orders-view-tab ${activeTab === 'myOrders' ? 'orders-view-tab-active' : ''}`}
									>
										Mis Pedidos ({myOrders.length})
									</button>
								</div>
								<MyOrdersView
									orders={myOrders}
									onSelectOrder={undefined}
									onUpdateStatus={handleUpdateStatus}
									selectedOrder={null}
									onCloseOrder={undefined}
									currentDriver={currentDriver}
								/>
							</>
						)
					)}

					{activeView === 'completed' && (
						<div className="driver-stats">
							<div className="driver-stats-grid">
								<div className="driver-stat-card">
									<div className="driver-stat-content">
										<div className="driver-stat-icon driver-stat-icon-green">
											<CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
										</div>
										<p className="driver-stat-label">Total Completados</p>
										<p className="driver-stat-value">{completedOrders.length}</p>
									</div>
								</div>
							</div>

							{completedOrders.length > 0 ? (
								<OrderList
									orders={completedOrders}
									onSelectOrder={undefined}
									onDeleteOrder={handleDeleteOrder}
									onAcceptOrder={undefined}
									onUpdateStatus={undefined}
								/>
							) : (
								<div className="driver-empty-state">
									<CheckCircle className="driver-empty-icon" />
									<p className="driver-empty-title">No hay pedidos completados</p>
									<p className="driver-empty-text">Los pedidos que completes aparecerán aquí</p>
								</div>
							)}
						</div>
					)}

					{activeView === 'profile' && <DriverProfile driverName={finalDriverName} />}
					{activeView === 'wallet' && <DriverWallet orders={orders} />}
					{activeView === 'settings' && <DriverSettings onLogout={onLogout} />}
				</motion.div>
			</main>

			{/* Bottom Navigation */}
			<BottomNavigation
				activeTab={getCurrentView()}
				onTabChange={handleTabChange}
				availableOrdersCount={availableOrders.length}
			/>

			{/* Modal de pedidos asignados (se abre desde burbuja flotante nativa) */}
			<AnimatePresence>
				{showOrdersModal && (
					<>
						<motion.div
							className="floating-button-overlay"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setShowOrdersModal(false)}
						/>
						<motion.div
							className="floating-button-panel"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ type: 'spring', stiffness: 300, damping: 25 }}
						>
							<div className="floating-button-panel-header">
								<h3 className="floating-button-panel-title">Mis Pedidos</h3>
								<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
									<span className="floating-button-panel-count">{myOrders.length}</span>
									<button
										onClick={() => setShowOrdersModal(false)}
										style={{
											background: 'rgba(255, 255, 255, 0.2)',
											border: 'none',
											borderRadius: '50%',
											width: '2rem',
											height: '2rem',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											color: 'white',
										}}
									>
										<X size={16} />
									</button>
								</div>
							</div>
							<div className="floating-button-panel-content">
								{myOrders.length === 0 ? (
									<div className="floating-button-panel-empty">
										<Package className="floating-button-panel-empty-icon" />
										<p className="floating-button-panel-empty-text">No tienes pedidos asignados</p>
									</div>
								) : (
									<div className="floating-button-panel-orders">
										{myOrders.map((order) => (
											<div key={order.id} className="floating-button-order-item">
												<OrderCard
													order={order}
													onClick={() => {
														onViewChange('orders');
														setActiveTab('myOrders');
														setShowOrdersModal(false);
													}}
													onAcceptOrder={handleAcceptOrder}
													onUpdateStatus={handleUpdateStatus}
												/>
											</div>
										))}
									</div>
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Modal de Soporte */}
			{showSupport && (
				<Modal onClose={() => setShowSupport(false)}>
					<SupportChat
						currentDriver={currentDriver}
						onClose={() => setShowSupport(false)}
					/>
				</Modal>
			)}
		</div>
	);
}
