import { useState, useEffect, useRef } from 'react';
import { OrderList } from '../orders/OrderList';
import { OrderDetail } from '../orders/OrderDetail';
import { DriverProfile } from './DriverProfile';
import { DriverWallet } from './DriverWallet';
import { DriverSettings } from './DriverSettings';
import { supabase } from '../../utils/supabase';
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
	isOnline
}) {
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [activeTab, setActiveTab] = useState('available');

	// Obtener información del driver desde localStorage
	const driverData = JSON.parse(localStorage.getItem('driver') || '{}');
	const driverId = driverData?.id;
	const driverName = driverData?.name || 'Repartidor';

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

			setSelectedOrder(null);
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

				// Si el pedido seleccionado fue revertido, cerrarlo
				if (selectedOrder && ordersToRevert.find(o => o.id === selectedOrder.id)) {
					setSelectedOrder(null);
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
	}, [orders, selectedOrder, onReloadOrders]);

	// Los repartidores no pueden eliminar pedidos
	const handleDeleteOrder = undefined;

	return (
		<div className="driver-app">
			<div className="driver-main">
				{activeView === 'orders' && (
					<div className="driver-stats">
						<div className="driver-stats-grid">
							<div className="driver-stat-card">
								<div className="driver-stat-content">
									<div className="driver-stat-icon driver-stat-icon-blue">
										<Package style={{ width: '1.25rem', height: '1.25rem' }} />
									</div>
									<p className="driver-stat-label">Disponibles</p>
									<p className="driver-stat-value">{availableOrders.length}</p>
								</div>
							</div>

							<div className="driver-stat-card">
								<div className="driver-stat-content">
									<div className="driver-stat-icon driver-stat-icon-orange">
										<Package style={{ width: '1.25rem', height: '1.25rem' }} />
									</div>
									<p className="driver-stat-label">Mis Pedidos</p>
									<p className="driver-stat-value">{myOrders.length}</p>
								</div>
							</div>

							<div className="driver-stat-card">
								<div className="driver-stat-content">
									<div className="driver-stat-icon driver-stat-icon-green">
										<Package style={{ width: '1.25rem', height: '1.25rem' }} />
									</div>
									<p className="driver-stat-label">Completados</p>
									<p className="driver-stat-value">{completedOrders.length}</p>
								</div>
							</div>
						</div>

						<div className="driver-tabs">
							<button
								onClick={() => setActiveTab('available')}
								className={`driver-tab ${activeTab === 'available' ? 'driver-tab-active' : 'driver-tab-inactive'}`}
							>
								Pedidos Disponibles ({availableOrders.length})
							</button>
							<button
								onClick={() => setActiveTab('myOrders')}
								className={`driver-tab ${activeTab === 'myOrders' ? 'driver-tab-active' : 'driver-tab-inactive'}`}
							>
								Mis Pedidos ({myOrders.length})
							</button>
						</div>

						{activeTab === 'available' ? (
							<>
								{!isOnline && (
									<div className="driver-location-warning">
										<MapPin />
										<p>Activa el botón "Conectado" en la parte superior para activar tu ubicación GPS y ver pedidos cercanos (radio de {PROXIMITY_RADIUS_KM} km)</p>
									</div>
								)}
								{isOnline && !hasLocation && locationLoading && (
									<div className="driver-location-warning">
										<MapPin />
										<p>Obteniendo tu ubicación GPS...</p>
									</div>
								)}
								{isOnline && !hasLocation && !locationLoading && (
									<div className="driver-location-warning">
										<MapPin />
										<p>No se pudo obtener tu ubicación GPS. Verifica los permisos de ubicación en tu dispositivo.</p>
									</div>
								)}
								{availableOrders.length > 0 ? (
									<OrderList
										orders={availableOrders}
										onSelectOrder={setSelectedOrder}
										onDeleteOrder={handleDeleteOrder}
									/>
								) : (
									<div className="driver-empty-state">
										<MapPin className="driver-empty-icon" />
										<p className="driver-empty-title">No hay pedidos disponibles</p>
										<p className="driver-empty-text">
											{!isOnline
												? 'Activa el botón "Conectado" para activar tu ubicación GPS y ver pedidos cercanos'
												: hasLocation 
													? `No hay pedidos pendientes dentro de ${PROXIMITY_RADIUS_KM} km de tu ubicación`
													: 'Obteniendo tu ubicación GPS...'
											}
										</p>
									</div>
								)}
							</>
						) : (
							myOrders.length > 0 ? (
								<OrderList
									orders={myOrders}
									onSelectOrder={setSelectedOrder}
									onDeleteOrder={handleDeleteOrder}
								/>
							) : (
								<div className="driver-empty-state">
									<Package className="driver-empty-icon" />
									<p className="driver-empty-title">No tienes pedidos activos</p>
									<p className="driver-empty-text">Acepta pedidos de la pestaña "Disponibles"</p>
								</div>
							)
						)}
					</div>
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
								onSelectOrder={setSelectedOrder}
								onDeleteOrder={handleDeleteOrder}
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

				{activeView === 'profile' && <DriverProfile driverName={driverName} />}
				{activeView === 'wallet' && <DriverWallet orders={orders} />}
				{activeView === 'settings' && <DriverSettings />}
			</div>

			{selectedOrder && (
				<div className="driver-modal-overlay">
					<div className="driver-modal-content">
						<OrderDetail
							order={selectedOrder}
							onClose={() => setSelectedOrder(null)}
							onAcceptOrder={handleAcceptOrder}
							onUpdateStatus={handleUpdateStatus}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
