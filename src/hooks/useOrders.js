import { useState, useEffect, useCallback } from 'react';
import { loadOrders, createOrder, deleteOrder } from '../services/orderService';
import { generatePickupCode } from '../utils/utils';

/**
 * Hook para gestionar pedidos
 */
export function useOrders(currentUser) {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchOrders = useCallback(async () => {
		if (!currentUser) return;

		setLoading(true);
		try {
			const companyId = currentUser.companyId || currentUser.company_id;
			const localId = currentUser.role === 'local' ? currentUser.localId : null;
			const loadedOrders = await loadOrders(companyId, localId);
			setOrders(loadedOrders);
		} catch (err) {
			console.error('Error cargando pedidos:', err);
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	// Cargar pedidos cuando cambia el usuario
	useEffect(() => {
		if (currentUser) {
			fetchOrders();
		}
	}, [currentUser, fetchOrders]);

	// Recargar pedidos periódicamente
	useEffect(() => {
		if (!currentUser) return;

		const interval = setInterval(() => {
			fetchOrders();
		}, 10000); // Cada 10 segundos

		return () => clearInterval(interval);
	}, [currentUser, fetchOrders]);

	const handleCreateOrder = useCallback(async (orderData, clients, localConfigs) => {
		if (!currentUser) return;

		try {
			// Buscar cliente por ID o nombre
			let client = null;
			if (orderData.selectedClientId) {
				client = clients.find(c => c.id === orderData.selectedClientId || c._dbId?.toString() === orderData.selectedClientId);
			}
			if (!client && orderData.clientName) {
				client = clients.find(c => c.name === orderData.clientName);
			}
			if (!client) {
				throw new Error('Cliente no encontrado. Por favor selecciona un cliente de la lista.');
			}

			// Buscar local por nombre
			const local = localConfigs.find(l => l.name === orderData.local);
			if (!local) {
				throw new Error('Local no encontrado');
			}

			const pickupCode = generatePickupCode();

			const newOrder = await createOrder({
				clientId: client._dbId || client.id,
				localId: local.id,
				pickupAddress: orderData.pickupAddress,
				deliveryAddress: orderData.deliveryAddress,
				suggestedPrice: orderData.suggestedPrice,
				notes: orderData.notes,
				pickupCode,
			}, currentUser.companyId, currentUser.id);

			setOrders(prev => [newOrder, ...prev]);
			return newOrder;
		} catch (err) {
			console.error('Error creando pedido:', err);
			throw err;
		}
	}, [currentUser]);

	const handleDeleteOrder = useCallback(async (orderId) => {
		try {
			const order = orders.find(o => o.id === orderId);
			if (!order) return;

			await deleteOrder(order._dbId);
			setOrders(prev => prev.filter(o => o.id !== orderId));
			return true;
		} catch (err) {
			console.error('Error eliminando pedido:', err);
			throw err;
		}
	}, [orders]);

	return {
		orders,
		setOrders,
		loading,
		createOrder: handleCreateOrder,
		deleteOrder: handleDeleteOrder,
		reloadOrders: fetchOrders,
	};
}

