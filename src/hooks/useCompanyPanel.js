import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { isAdminOrEmpresarial, generatePickupCode } from '../utils/utils';

/**
 * Hook para gestionar la lógica del panel de empresa
 */
export function useCompanyPanel(currentUser, orders, setOrders, localConfigs, setLocalConfigs) {
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showClientManagement, setShowClientManagement] = useState(false);
	const [showUserManagement, setShowUserManagement] = useState(false);
	const [showLocalSettings, setShowLocalSettings] = useState(false);
	const [activeTab, setActiveTab] = useState('all');
	const [selectedLocal, setSelectedLocal] = useState('Todos');
	const [showLocalDropdown, setShowLocalDropdown] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		// Si es usuario local, establecer automáticamente su local
		if (currentUser?.role === 'local' && currentUser.local) {
			setSelectedLocal(currentUser.local);
		}
	}, [currentUser]);

	const handleCreateOrder = async (orderData, clients) => {
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

			// Crear pedido en Supabase
			const { data, error } = await supabase
				.from('orders')
				.insert({
					company_id: currentUser.companyId,
					client_id: client._dbId || client.id,
					local_id: local.id,
					user_id: currentUser.id,
					pickup_address: orderData.pickupAddress,
					delivery_address: orderData.deliveryAddress,
					suggested_price: orderData.suggestedPrice,
					notes: orderData.notes || null,
					status: 'Pendiente',
					pickup_code: pickupCode,
				})
				.select(`
					*,
					clients(name, phone, address),
					locals(name),
					company_users(name, username),
					drivers(name, phone)
				`)
				.single();

			if (error) throw error;

			// Formatear pedido para la app
			const newOrder = {
				id: `ORD-${data.id}`,
				clientName: data.clients?.name || '',
				clientPhone: data.clients?.phone || '',
				pickupAddress: data.pickup_address,
				deliveryAddress: data.delivery_address,
				local: data.locals?.name || '',
				suggestedPrice: parseFloat(data.suggested_price),
				notes: data.notes || '',
				status: data.status,
				pickupCode: data.pickup_code,
				driverName: null,
				driverId: null,
				createdAt: new Date(data.created_at),
				updatedAt: new Date(data.updated_at),
				_dbId: data.id,
				_dbClientId: data.client_id,
				_dbLocalId: data.local_id,
				_dbUserId: data.user_id,
			};

			setOrders([newOrder, ...orders]);
			setShowCreateForm(false);
			return newOrder;
		} catch (err) {
			throw new Error('Error al crear pedido: ' + err.message);
		}
	};

	const handleDeleteOrder = async (orderId) => {
		try {
			const order = orders.find(o => o.id === orderId);
			if (!order) return;

			const { error } = await supabase
				.from('orders')
				.delete()
				.eq('id', order._dbId);

			if (error) throw error;

			setOrders(orders.filter(o => o.id !== orderId));
			if (selectedOrder?.id === orderId) {
				setSelectedOrder(null);
			}
			return true;
		} catch (err) {
			throw new Error('Error al eliminar pedido: ' + err.message);
		}
	};

	const handleSaveLocalConfigs = async (configs) => {
		if (!currentUser) return;

		try {
			// Obtener IDs de locales existentes
			const existingLocals = localConfigs.filter(l => l.id);
			const newLocals = configs.filter(l => !l.id);

			// Actualizar locales existentes
			for (const local of existingLocals) {
				const updatedLocal = configs.find(l => l.id === local.id);
				if (updatedLocal && (updatedLocal.name !== local.name || updatedLocal.address !== local.address)) {
					await supabase
						.from('locals')
						.update({
							name: updatedLocal.name,
							address: updatedLocal.address,
						})
						.eq('id', local.id);
				}
			}

			// Crear nuevos locales
			if (newLocals.length > 0) {
				const localsToInsert = newLocals.map(local => ({
					company_id: currentUser.companyId,
					name: local.name,
					address: local.address,
				}));

				await supabase
					.from('locals')
					.insert(localsToInsert);
			}

			// Recargar datos
			const { data, error } = await supabase
				.from('locals')
				.select('*')
				.eq('company_id', currentUser.companyId)
				.order('name');

			if (error) throw error;
			setLocalConfigs(data || []);
		} catch (err) {
			throw new Error('Error al guardar locales: ' + err.message);
		}
	};

	// Filtrar pedidos según el rol del usuario
	const userFilteredOrders = useMemo(() => {
		if (currentUser?.role === 'local' && currentUser.local) {
			return orders.filter(order => order.local === currentUser.local);
		}
		return orders;
	}, [orders, currentUser]);

	// Filtrar pedidos por estado y local
	const filteredOrders = useMemo(() => {
		let result = userFilteredOrders;

		// Filtrar por estado
		if (activeTab === 'active') {
			result = result.filter(order => order.status !== 'Entregado');
		} else if (activeTab === 'completed') {
			result = result.filter(order => order.status === 'Entregado');
		}

		// Filtrar por local (solo para admin y CEO)
		if (isAdminOrEmpresarial(currentUser?.role)) {
			if (selectedLocal !== 'Todos') {
				result = result.filter(order => order.local === selectedLocal);
			}
		}

		return result;
	}, [userFilteredOrders, activeTab, selectedLocal, currentUser?.role]);

	const locales = ['Todos', ...localConfigs.map(config => config.name)];

	return {
		// Estado
		selectedOrder,
		showCreateForm,
		showClientManagement,
		showUserManagement,
		showLocalSettings,
		activeTab,
		selectedLocal,
		showLocalDropdown,
		sidebarOpen,
		// Datos calculados
		userFilteredOrders,
		filteredOrders,
		locales,
		// Acciones
		setSelectedOrder,
		setShowCreateForm,
		setShowClientManagement,
		setShowUserManagement,
		setShowLocalSettings,
		setActiveTab,
		setSelectedLocal,
		setShowLocalDropdown,
		setSidebarOpen,
		handleCreateOrder,
		handleDeleteOrder,
		handleSaveLocalConfigs,
	};
}

