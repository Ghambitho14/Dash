import { useState, useEffect, useCallback } from 'react';
import { CompanyPanel } from './components/CompanyPanel';
import { Login } from './components/Login';
import { CompanyLayout } from './layouts/CompanyLayout';
import { supabase } from './utils/supabase';
import { generatePickupCode } from './utils/utils';

export default function App() {
	const [currentUser, setCurrentUser] = useState(null);
	const [orders, setOrders] = useState([]);
	const [localConfigs, setLocalConfigs] = useState([]);
	const [clients, setClients] = useState([]);
	const [users, setUsers] = useState([]);
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
		if (!currentUser) return;

		try {
			const companyId = currentUser.companyId || currentUser.company_id;
			if (!companyId) {
				console.error('No se encontró companyId');
				return;
			}

			// Crear consulta base
			let query = supabase
				.from('orders')
				.select(`
					*,
					clients(name, phone, address),
					locals(name),
					company_users(name, username),
					drivers(name, phone)
				`)
				.eq('company_id', companyId)
				.order('created_at', { ascending: false });

			// Si es usuario local, solo ver pedidos de su local
			if (currentUser.role === 'local' && currentUser.localId) {
				query = query.eq('local_id', currentUser.localId);
			}

			const { data, error } = await query;
			if (error) throw error;

			// Formatear todos los pedidos
			const formattedOrders = (data || []).map(formatOrder);
			setOrders(formattedOrders);
		} catch (err) {
			console.error('Error cargando pedidos:', err);
		}
	}, [currentUser]);

	// Cargar datos cuando el usuario se loguea
	useEffect(() => {
		if (currentUser) {
			loadData();
		}
	}, [currentUser]);

	// Recargar pedidos periódicamente para ver cambios en tiempo real (cuando repartidor acepta pedidos)
	useEffect(() => {
		if (!currentUser) return;

		const interval = setInterval(() => {
			loadOrders();
		}, 10000); // Recargar cada 10 segundos

		return () => clearInterval(interval);
	}, [currentUser, loadOrders]);

	// Función para formatear cliente
	const formatClient = (client) => {
		return {
			...client,
			id: `CLI-${client.id}`,
			local: client.locals?.name || '',
			_dbId: client.id,
			_dbLocalId: client.local_id,
		};
	};

	// Función para formatear usuario
	const formatUser = (user) => {
		return {
			...user,
			id: `USR-${user.id}`,
			local: user.role === 'local' ? user.locals?.name : null,
			_dbId: user.id,
			_dbLocalId: user.local_id,
		};
	};

	// Cargar todos los datos cuando el usuario se loguea
	const loadData = async () => {
		if (!currentUser) return;
		setLoading(true);

		try {
			// 1. Cargar locales
			const { data: localsData, error: localsError } = await supabase
				.from('locals')
				.select('*')
				.eq('company_id', currentUser.companyId)
				.order('name');

			if (localsError) throw localsError;
			setLocalConfigs(localsData || []);

			// 2. Cargar clientes
			const { data: clientsData, error: clientsError } = await supabase
				.from('clients')
				.select('*, locals(name)')
				.eq('company_id', currentUser.companyId)
				.order('created_at', { ascending: false });

			if (clientsError) throw clientsError;
			const formattedClients = (clientsData || []).map(formatClient);
			setClients(formattedClients);

			// 3. Cargar usuarios
			const { data: usersData, error: usersError } = await supabase
				.from('company_users')
				.select('*, locals(name)')
				.eq('company_id', currentUser.companyId)
				.order('created_at', { ascending: false });

			if (usersError) throw usersError;
			const formattedUsers = (usersData || []).map(formatUser);
			setUsers(formattedUsers);

			// 4. Cargar pedidos
			await loadOrders();
		} catch (err) {
			console.error('Error cargando datos:', err);
			alert('Error al cargar los datos');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		setCurrentUser(null);
	};

	// Si no hay usuario logueado, mostrar login
	if (!currentUser) {
		return <Login onLogin={setCurrentUser} users={[]} />;
	}

	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<p>Cargando...</p>
			</div>
		);
	}

	// Crear nuevo cliente
	const handleCreateClient = async (clientData) => {
		if (!currentUser) return;

		try {
			// Buscar el local por nombre
			const local = localConfigs.find(l => l.name === clientData.local);
			if (!local) {
				alert('Local no encontrado');
				return;
			}

			// Insertar en Supabase
			const { data, error } = await supabase
				.from('clients')
				.insert({
					company_id: currentUser.companyId,
					name: clientData.name,
					phone: clientData.phone,
					address: clientData.address,
					local_id: local.id,
				})
				.select()
				.single();

			if (error) throw error;

			// Formatear y agregar a la lista
			const newClient = {
				...data,
				id: `CLI-${data.id}`,
				local: clientData.local,
				_dbId: data.id,
				_dbLocalId: data.local_id,
			};
			setClients([newClient, ...clients]);
		} catch (err) {
			alert('Error al crear cliente: ' + err.message);
		}
	};

	// Actualizar cliente existente
	const handleUpdateClient = async (clientId, clientData) => {
		if (!currentUser) return;

		try {
			// Buscar cliente
			const client = clients.find(c => c.id === clientId);
			if (!client) return;

			// Buscar local
			const local = localConfigs.find(l => l.name === clientData.local);
			if (!local) {
				alert('Local no encontrado');
				return;
			}

			// Actualizar en Supabase
			const { error } = await supabase
				.from('clients')
				.update({
					name: clientData.name,
					phone: clientData.phone,
					address: clientData.address,
					local_id: local.id,
				})
				.eq('id', client._dbId || client.id);

			if (error) throw error;

			// Recargar todos los datos
			await loadData();
		} catch (err) {
			alert('Error al actualizar cliente: ' + err.message);
		}
	};

	// Eliminar cliente
	const handleDeleteClient = async (clientId) => {
		if (!currentUser) return;

		// Confirmar eliminación
		if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
			return;
		}

		try {
			// Buscar cliente
			const client = clients.find(c => c.id === clientId);
			if (!client) return;

			// Eliminar de Supabase
			const { error } = await supabase
				.from('clients')
				.delete()
				.eq('id', client._dbId || client.id);

			if (error) throw error;

			// Remover de la lista
			setClients(clients.filter(c => c.id !== clientId));
		} catch (err) {
			alert('Error al eliminar cliente: ' + err.message);
		}
	};

	// Crear nuevo usuario
	const handleCreateUser = async (userData) => {
		if (!currentUser) return;

		try {
			// Buscar local si existe
			const local = userData.local ? localConfigs.find(l => l.name === userData.local) : null;

			// Insertar en Supabase
			const { data, error } = await supabase
				.from('company_users')
				.insert({
					company_id: currentUser.companyId,
					username: userData.username,
					password: userData.password,
					role: userData.role,
					name: userData.name,
					local_id: local?.id || null,
				})
				.select('*, locals(name)')
				.single();

			if (error) throw error;

			// Formatear y agregar a la lista
			const newUser = {
				...data,
				id: `USR-${data.id}`,
				local: data.role === 'local' ? data.locals?.name : null,
				_dbId: data.id,
				_dbLocalId: data.local_id,
			};
			setUsers([newUser, ...users]);
		} catch (err) {
			alert('Error al crear usuario: ' + err.message);
		}
	};

	// Actualizar usuario existente
	const handleUpdateUser = async (userId, userData) => {
		if (!currentUser) return;

		// Los admins no pueden editar al CEO
		if (currentUser.role === 'admin') {
			const userToUpdate = users.find(user => user.id === userId);
			if (userToUpdate && userToUpdate.role === 'empresarial') {
				alert('No puedes editar el usuario CEO. Solo el CEO puede modificar su propia cuenta.');
				return;
			}
		}

		try {
			// Buscar usuario
			const user = users.find(u => u.id === userId);
			if (!user) return;

			// Buscar local si existe
			const local = userData.local ? localConfigs.find(l => l.name === userData.local) : null;

			// Actualizar en Supabase
			const { error } = await supabase
				.from('company_users')
				.update({
					username: userData.username,
					password: userData.password,
					role: userData.role,
					name: userData.name,
					local_id: local?.id || null,
				})
				.eq('id', user._dbId || user.id);

			if (error) throw error;

			// Recargar todos los datos
			await loadData();
		} catch (err) {
			alert('Error al actualizar usuario: ' + err.message);
		}
	};

	// Eliminar usuario
	const handleDeleteUser = async (userId) => {
		if (!currentUser) return;

		// No se puede eliminar al CEO
		const userToDelete = users.find(user => user.id === userId);
		if (userToDelete && userToDelete.role === 'empresarial') {
			alert('No se puede eliminar el usuario CEO. Este usuario es esencial para el sistema.');
			return;
		}

		// Confirmar eliminación
		if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
			return;
		}

		try {
			// Buscar usuario
			const user = users.find(u => u.id === userId);
			if (!user) return;

			// Eliminar de Supabase
			const { error } = await supabase
				.from('company_users')
				.delete()
				.eq('id', user._dbId || user.id);

			if (error) throw error;

			// Remover de la lista
			setUsers(users.filter(u => u.id !== userId));
		} catch (err) {
			alert('Error al eliminar usuario: ' + err.message);
		}
	};

	// Solo vista de empresa
	return (
		<CompanyLayout currentUser={currentUser} onLogout={handleLogout}>
			<CompanyPanel 
				currentUser={currentUser} 
				orders={orders} 
				setOrders={setOrders}
				onReloadOrders={loadOrders}
				localConfigs={localConfigs}
				setLocalConfigs={setLocalConfigs}
				clients={clients}
				onCreateClient={handleCreateClient}
				onUpdateClient={handleUpdateClient}
				onDeleteClient={handleDeleteClient}
				users={users}
				onCreateUser={handleCreateUser}
				onUpdateUser={handleUpdateUser}
				onDeleteUser={handleDeleteUser}
			/>
		</CompanyLayout>
	);
}

