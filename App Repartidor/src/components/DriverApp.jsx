import { useState, useEffect } from 'react';
import { OrderList } from './OrderList';
import { OrderDetail } from './OrderDetail';
import { DriverProfile } from './DriverProfile';
import { DriverWallet } from './DriverWallet';
import { DriverSettings } from './DriverSettings';
import { supabase } from '../utils/supabase';
import { Package, MapPin, CheckCircle } from 'lucide-react';
import '../styles/Components/DriverApp.css';
import { validateOrderForTransition } from './orderStateMachine.jsx';


export function DriverApp({ orders, setOrders, onReloadOrders, activeView, onViewChange }) {
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [activeTab, setActiveTab] = useState('available');
	
	// Obtener información del driver desde localStorage
	const driverData = JSON.parse(localStorage.getItem('driver') || '{}');
	const driverId = driverData?.id;
	const driverName = driverData?.name || 'Repartidor';

	// Los pedidos disponibles se muestran basados en GPS (simulado - en producción sería con geolocalización real)
	const availableOrders = orders.filter(
		order => order.status === 'Pendiente'
	);

	const myOrders = orders.filter(
		order => order.driverId === driverId && order.status !== 'Entregado'
	);

	const completedOrders = orders.filter(
		order => order.driverId === driverId && order.status === 'Entregado'
	);

	// Aceptar un pedido
	const handleAcceptOrder = async (orderId) => {
		const order = orders.find(order => order.id === orderId);
		if (!order) return;

		try {
			// Actualizar pedido a "Asignado" en Supabase
			const { error } = await supabase
				.from('orders')
				.update({
					status: 'Asignado',
					driver_id: driverId,
				})
				.eq('id', order._dbId);

			if (error) throw error;

			// Guardar en historial
			await supabase
				.from('order_status_history')
				.insert({
					order_id: order._dbId,
					status: 'Asignado',
					driver_id: driverId,
				});

			// Recargar pedidos y cambiar a la pestaña "Mis Pedidos"
			if (onReloadOrders) {
				await onReloadOrders();
			}
			setSelectedOrder(null);
			setActiveTab('myOrders');
		} catch (err) {
			alert('Error al aceptar pedido: ' + err.message);
		}
	};

	// Actualizar el estado de un pedido
	// Actualizar el estado de un pedido
const handleUpdateStatus = async (orderId, newStatus) => {
	const order = orders.find(o => o.id === orderId);
	if (!order) return;

	// ✅ Validación con máquina de estados (antes de tocar Supabase)
	const check = validateOrderForTransition(order, newStatus);
	if (!check.ok) {
		alert(check.reason);
		return;
	}

	try {
		// Actualizar estado en Supabase
		const { error } = await supabase
			.from('orders')
			.update({
				status: newStatus,
			})
			.eq('id', order._dbId);

		if (error) throw error;

		// Guardar en historial
		await supabase
			.from('order_status_history')
			.insert({
				order_id: order._dbId,
				status: newStatus,
				driver_id: driverId,
			});

		// Recargar pedidos
		if (onReloadOrders) {
			await onReloadOrders();
		}
	} catch (err) {
		alert('Error al actualizar estado: ' + err.message);
	}
};

	// Recargar pedidos cada 30 segundos para mantenerlos actualizados
	useEffect(() => {
		if (!driverId || !onReloadOrders) return;

		const interval = setInterval(() => {
			onReloadOrders();
		}, 1000); // 1 segundos

		return () => clearInterval(interval);
	}, [driverId, onReloadOrders]);

	// Revertir pedidos "Asignado" que llevan más de 1 minuto sin actualizar
	useEffect(() => {
		const interval = setInterval(async () => {
			const now = new Date();
			const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minuto

			// Buscar pedidos que necesitan revertirse
			const ordersToRevert = orders.filter(order => {
				return order.status === 'Asignado' && new Date(order.updatedAt) < oneMinuteAgo;
			});

			// Si hay pedidos para revertir
			if (ordersToRevert.length === 0) return;

			// Revertir cada pedido
			for (const order of ordersToRevert) {
				try {
					// Cambiar estado a Pendiente
					await supabase
						.from('orders')
						.update({
							status: 'Pendiente',
							driver_id: null,
						})
						.eq('id', order._dbId);

					// Guardar en historial
					await supabase
						.from('order_status_history')
						.insert({
							order_id: order._dbId,
							status: 'Pendiente',
							driver_id: null,
							notes: 'Revertido automáticamente por timeout',
						});
				} catch (err) {
					console.error('Error revirtiendo pedido:', err);
				}
			}

			// Si el pedido seleccionado fue revertido, cerrarlo
			if (selectedOrder && ordersToRevert.find(o => o.id === selectedOrder.id)) {
				setSelectedOrder(null);
				setActiveTab('available');
			}

			// Recargar pedidos
			if (onReloadOrders) {
				onReloadOrders();
			}
		}, 1000); // Verificar cada segundo

		return () => clearInterval(interval);
	}, [orders, selectedOrder, onReloadOrders]);

	// Los repartidores no pueden eliminar pedidos
	const handleDeleteOrder = undefined;

	return (
		<div className="driver-app">
			{/* Main Content */}
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

						{/* Tabs */}
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

						{/* Orders List */}
						{activeTab === 'available' ? (
							availableOrders.length > 0 ? (
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
										No hay pedidos pendientes cerca de tu ubicación
									</p>
								</div>
							)
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
									<p className="driver-empty-text">
										Acepta pedidos de la pestaña "Disponibles"
									</p>
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

						{/* Orders List */}
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
								<p className="driver-empty-text">
									Los pedidos que completes aparecerán aquí
								</p>
							</div>
						)}
					</div>
				)}

				{activeView === 'profile' && (
					<DriverProfile driverName={driverName} />
				)}

				{activeView === 'wallet' && (
					<DriverWallet orders={orders} />
				)}

				{activeView === 'settings' && (
					<DriverSettings />
				)}
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
