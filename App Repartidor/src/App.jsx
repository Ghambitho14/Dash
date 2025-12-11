import { useState, useEffect, useCallback } from 'react';
import { DriverApp } from './components/DriverApp';
import { Login } from './components/Login';
import { DriverLayout } from './layouts/DriverLayout';
import { supabase } from './utils/supabase';

export default function App() {
	const [currentDriver, setCurrentDriver] = useState(null);
	const [orders, setOrders] = useState([]);
	const [driverActiveView, setDriverActiveView] = useState('orders');
	const [loading, setLoading] = useState(false);

	// Función para formatear un pedido
	const formatOrder = (order) => {
		return {
			id: `ORD-${order.id}`,
			clientName: order.clients?.name || '',
			clientPhone: order.clients?.phone || '',
			pickupAddress: order.pickup_address,
			deliveryAddress: order.delivery_address,
			local: order.locals?.name || '',
			suggestedPrice: parseFloat(order.suggested_price),
			notes: order.notes || '',
			status: order.status,
			pickupCode: order.pickup_code,
			driverName: order.drivers?.name || null,
			driverId: order.driver_id,
			createdAt: new Date(order.created_at),
			updatedAt: new Date(order.updated_at),
			_dbId: order.id,
			_dbClientId: order.client_id,
			_dbLocalId: order.local_id,
			_dbUserId: order.user_id,
		};
	};

	// Cargar pedidos desde Supabase
	const loadOrders = useCallback(async () => {
		if (!currentDriver) return;
		setLoading(true);

		try {
			const companyId = currentDriver.companyId || currentDriver.company_id;
			const driverId = currentDriver.id;

			// Crear consulta base
			let query = supabase
				.from('orders')
				.select(`
					*,
					clients(name, phone, address),
					locals(name, address),
					company_users(name),
					drivers(name, phone)
				`);

			// Si tiene empresa, filtrar por empresa
			if (companyId) {
				query = query.eq('company_id', companyId);
			}

			// Cargar pedidos pendientes O pedidos asignados a este driver
			const { data, error } = await query
				.or(`status.eq.Pendiente,driver_id.eq.${driverId}`)
				.order('created_at', { ascending: false });

			if (error) throw error;

			// Formatear todos los pedidos
			const formattedOrders = (data || []).map(formatOrder);
			setOrders(formattedOrders);
		} catch (err) {
			console.error('Error cargando pedidos:', err);
			alert('Error al cargar los pedidos');
		} finally {
			setLoading(false);
		}
	}, [currentDriver]);

	// Cargar pedidos cuando el driver se loguea
	useEffect(() => {
		if (currentDriver) {
			loadOrders();
		}
	}, [currentDriver, loadOrders]);

	const handleLogin = (driver) => {
		setCurrentDriver(driver);
		// Guardar driver en localStorage (para compatibilidad)
		localStorage.setItem('driver', JSON.stringify(driver));
	};

	const handleLogout = () => {
		setCurrentDriver(null);
		localStorage.removeItem('driver');
		localStorage.removeItem('orders');
	};

	// Si no hay driver logueado, mostrar login
	if (!currentDriver) {
		return <Login onLogin={handleLogin} />;
	}

	if (loading && orders.length === 0) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<p>Cargando pedidos...</p>
			</div>
		);
	}

	return (
		<DriverLayout 
			driverName={currentDriver.name}
			activeView={driverActiveView}
			onViewChange={setDriverActiveView}
			onLogout={handleLogout}
		>
			<DriverApp 
				orders={orders} 
				setOrders={setOrders}
				onReloadOrders={loadOrders}
				activeView={driverActiveView}
				onViewChange={setDriverActiveView}
			/>
		</DriverLayout>
	);
}

