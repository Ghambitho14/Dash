import { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { OrderList } from './OrderList';
import { OrderDetail } from './driver/OrderDetail';
import { DriverProfile } from './driver/DriverProfile';
import { DriverWallet } from './driver/DriverWallet';
import { DriverSettings } from './driver/DriverSettings';
import { Package, MapPin } from 'lucide-react';
import '../styles/Components/DriverApp.css';

interface DriverAppProps {
	orders: Order[];
	setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
	activeView: 'orders' | 'profile' | 'wallet' | 'settings';
	onViewChange: (view: 'orders' | 'profile' | 'wallet' | 'settings') => void;
}

export function DriverApp({ orders, setOrders, activeView, onViewChange }: DriverAppProps) {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [activeTab, setActiveTab] = useState<'available' | 'myOrders'>('available');
	const driverId = 'driver-1';
	const driverName = 'Juan Pérez';

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

	const handleAcceptOrder = (orderId: string) => {
		const updatedOrder = orders.find(order => order.id === orderId);
		if (!updatedOrder) return;

		// Asegurar que el pedido se establezca en estado "Asignado" cuando se acepta
		// independientemente del estado anterior
		const newOrder: Order = { 
			...updatedOrder, 
			status: 'Asignado' as Order['status'], 
			driverId, 
			driverName, 
			updatedAt: new Date() 
		};
		
		// Actualizar los pedidos
		setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? newOrder : order));
		
		// Actualizar el pedido seleccionado para forzar el re-renderizado
		setSelectedOrder(newOrder);
		
		setActiveTab('myOrders');
	};

	const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
		const update = { status: newStatus, updatedAt: new Date() };
		setOrders(orders.map(order => order.id === orderId ? { ...order, ...update } : order));
		if (selectedOrder?.id === orderId) {
			setSelectedOrder({ ...selectedOrder, ...update });
		}
	};

	// Verificar cada segundo si hay pedidos "Asignado" con más de 1 minuto sin actualizar
	useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date();
			const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 minuto = 60,000 ms

			setOrders(prevOrders => {
				const updatedOrders = prevOrders.map(order => {
					// Si el pedido está "Asignado" y fue actualizado hace más de 1 minuto
					if (
						order.status === 'Asignado' &&
						new Date(order.updatedAt) < oneMinuteAgo
					) {
						// Revertir a "Pendiente" y quitar el repartidor
						return {
							...order,
							status: 'Pendiente' as Order['status'],
							driverId: undefined,
							driverName: undefined,
							updatedAt: new Date()
						};
					}
					return order;
				});

				// Si el pedido seleccionado fue revertido, cerrar el modal y cambiar a la pestaña de disponibles
				if (selectedOrder) {
					const revertedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
					if (revertedOrder && revertedOrder.status === 'Pendiente' && selectedOrder.status === 'Asignado') {
						setSelectedOrder(null);
						setActiveTab('available');
					} else if (revertedOrder) {
						// Actualizar el pedido seleccionado si existe
						setSelectedOrder(revertedOrder);
					}
				}

				return updatedOrders;
			});
		}, 1000); // Verificar cada segundo

		return () => clearInterval(interval);
	}, [selectedOrder]);

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

        {activeView === 'profile' && (
          <DriverProfile driverName={driverName} />
        )}

        {activeView === 'wallet' && (
          <DriverWallet />
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
