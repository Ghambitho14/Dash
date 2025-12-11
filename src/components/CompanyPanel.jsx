import { useState, useEffect, useMemo } from 'react';
import { CreateOrderForm } from './CreateOrderForm';
import { ClientManagement } from './ClientManagement';
import { UserManagement } from './UserManagement';
import { OrderList } from './OrderList';
import { OrderDetail } from './OrderDetail';
import { LocalSettings } from './LocalSettings';
import { Modal } from './Modal';
import { generatePickupCode, isAdminOrEmpresarial, getRoleName } from '../utils/utils';
import { supabase } from '../utils/supabase';
import { Plus, Package, Building2, Store, ChevronDown, Settings, Menu, X, Users, UserCog } from 'lucide-react';
import '../styles/Components/CompanyPanel.css';

export function CompanyPanel({ currentUser, orders, setOrders, onReloadOrders, localConfigs, setLocalConfigs, clients, onCreateClient, onUpdateClient, onDeleteClient, users, onCreateUser, onUpdateUser, onDeleteUser }) {
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
		if (currentUser.role === 'local' && currentUser.local) {
			setSelectedLocal(currentUser.local);
		}
	}, [currentUser]);

	const handleCreateOrder = async (orderData) => {
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
				alert('Cliente no encontrado. Por favor selecciona un cliente de la lista.');
				return;
			}

			// Buscar local por nombre
			const local = localConfigs.find(l => l.name === orderData.local);
			if (!local) {
				alert('Local no encontrado');
				return;
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
		} catch (err) {
			alert('Error al crear pedido: ' + err.message);
		}
	};

	const handleDeleteOrder = async (orderId) => {
		if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
			return;
		}

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
		} catch (err) {
			alert('Error al eliminar pedido: ' + err.message);
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
			alert('Error al guardar locales: ' + err.message);
		}
	};

	// Filtrar pedidos según el rol del usuario
	// Si es usuario local, solo ver sus pedidos
	const userFilteredOrders = useMemo(() => {
		if (currentUser.role === 'local' && currentUser.local) {
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
		// Si activeTab === 'all', no filtrar por estado

		// Filtrar por local (solo para admin y CEO)
		if (isAdminOrEmpresarial(currentUser.role)) {
			if (selectedLocal !== 'Todos') {
				result = result.filter(order => order.local === selectedLocal);
			}
		}

		return result;
	}, [userFilteredOrders, activeTab, selectedLocal, currentUser.role]);

	const locales = ['Todos', ...localConfigs.map(config => config.name)];

	return (
		<div className="company-panel">
			{/* Overlay para móvil */}
			{sidebarOpen && (
				<div 
					className="company-overlay"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div className={`company-sidebar ${sidebarOpen ? 'company-sidebar-open' : ''}`}>
				{/* Company Info */}
				<div className="company-sidebar-header">
					<div className="company-sidebar-header-top">
						<div className="company-sidebar-user">
							<div className="company-sidebar-avatar">
								<Building2 />
							</div>
							<div className="company-sidebar-user-info">
								<h3>{currentUser.name}</h3>
								<p>
									{getRoleName(currentUser.role)}
								</p>
							</div>
						</div>
						{/* Botón cerrar en móvil */}
						<button
							onClick={() => setSidebarOpen(false)}
							className="company-sidebar-close"
						>
							<X />
						</button>
					</div>
					
					{/* Local Selector Dropdown - Solo para admin y empresarial */}
					{isAdminOrEmpresarial(currentUser.role) && (
						<div className="company-dropdown">
							<button
								onClick={() => setShowLocalDropdown(!showLocalDropdown)}
								className="company-dropdown-button"
							>
								<div className="company-dropdown-button-content">
									<Store />
									<span className="company-dropdown-button-text">{selectedLocal}</span>
								</div>
								<ChevronDown className={`company-dropdown-icon ${showLocalDropdown ? 'company-dropdown-icon-open' : ''}`} />
							</button>
							
							{showLocalDropdown && (
								<div className="company-dropdown-menu">
									{locales.map((local) => (
										<button
											key={local}
											onClick={() => {
												setSelectedLocal(local);
												setShowLocalDropdown(false);
											}}
											className={`company-dropdown-item ${selectedLocal === local ? 'company-dropdown-item-active' : ''}`}
										>
											{local}
										</button>
									))}
								</div>
							)}
						</div>
					)}
					
					{/* Local fijo para usuarios locales */}
					{currentUser.role === 'local' && currentUser.local && (
						<div className="company-local-badge">
							<Store />
							<span className="company-local-badge-text">{currentUser.local}</span>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="company-sidebar-actions">
					<button
						onClick={() => setShowCreateForm(true)}
						className="company-button company-button-primary"
					>
						<Plus />
						Crear Pedido
					</button>

					<button
						onClick={() => setShowClientManagement(true)}
						className="company-button company-button-secondary"
					>
						<Users />
						Configurar Clientes
					</button>

					{/* User Management Button - Solo para admin y empresarial */}
					{isAdminOrEmpresarial(currentUser.role) && (
						<button
							onClick={() => setShowUserManagement(true)}
							className="company-button company-button-secondary"
						>
							<UserCog />
							Gestionar Usuarios
						</button>
					)}

					{/* Settings Button - Solo para admin y empresarial */}
					{isAdminOrEmpresarial(currentUser.role) && (
						<button
							onClick={() => setShowLocalSettings(true)}
							className="company-button company-button-secondary"
						>
							<Settings />
							Configurar Locales
						</button>
					)}
				</div>

				{/* Stats in Sidebar */}
				<div className="company-sidebar-stats">
					<div className="company-stat-card company-stat-card-blue">
						<div className="company-stat-header">
							<Package />
							<p className="company-stat-label company-stat-label-blue">Total</p>
						</div>
						<p className="company-stat-value company-stat-value-blue">{userFilteredOrders.length} pedidos</p>
					</div>
					
					<div className="company-stat-card company-stat-card-yellow">
						<div className="company-stat-header">
							<Package />
							<p className="company-stat-label company-stat-label-yellow">Pendientes</p>
						</div>
						<p className="company-stat-value company-stat-value-yellow">{userFilteredOrders.filter(o => o.status === 'Pendiente').length} pedidos</p>
					</div>
					
					<div className="company-stat-card company-stat-card-orange">
						<div className="company-stat-header">
							<Package />
							<p className="company-stat-label company-stat-label-orange">En Proceso</p>
						</div>
						<p className="company-stat-value company-stat-value-orange">
							{userFilteredOrders.filter(o => o.status !== 'Pendiente' && o.status !== 'Entregado').length} pedidos
						</p>
					</div>
					
					<div className="company-stat-card company-stat-card-green">
						<div className="company-stat-header">
							<Package />
							<p className="company-stat-label company-stat-label-green">Entregados</p>
						</div>
						<p className="company-stat-value company-stat-value-green">{userFilteredOrders.filter(o => o.status === 'Entregado').length} pedidos</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="company-main">
				<div className="company-main-content">
					{/* Header interno con botón hamburguesa */}
					<div className="company-main-header">
						<div className="company-main-header-top">
							{/* Botón hamburguesa */}
							<button
								onClick={() => setSidebarOpen(true)}
								className="company-menu-button"
							>
								<Menu />
							</button>
							<div>
								<h2 className="company-main-title">Panel de Pedidos</h2>
								<p className="company-main-subtitle">
									{selectedLocal === 'Todos' 
										? 'Mostrando pedidos de todos los locales' 
										: `Mostrando pedidos del ${selectedLocal}`}
								</p>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className="company-tabs">
						<button
							onClick={() => setActiveTab('all')}
							className={`company-tab ${activeTab === 'all' ? 'company-tab-active' : ''}`}
						>
							Todos ({filteredOrders.length})
						</button>
						<button
							onClick={() => setActiveTab('active')}
							className={`company-tab ${activeTab === 'active' ? 'company-tab-active' : ''}`}
						>
							Activos ({filteredOrders.filter(o => o.status !== 'Entregado').length})
						</button>
						<button
							onClick={() => setActiveTab('completed')}
							className={`company-tab ${activeTab === 'completed' ? 'company-tab-active' : ''}`}
						>
							Completados ({filteredOrders.filter(o => o.status === 'Entregado').length})
						</button>
					</div>

					{/* Orders List */}
					<OrderList 
						orders={filteredOrders} 
						onSelectOrder={setSelectedOrder}
						onDeleteOrder={handleDeleteOrder}
					/>
				</div>
			</div>


			{/* Modals */}
			{showCreateForm && (
				<Modal onClose={() => setShowCreateForm(false)} maxWidth="2xl">
					<CreateOrderForm
						onSubmit={handleCreateOrder}
						onCancel={() => setShowCreateForm(false)}
						currentUser={currentUser}
						localConfigs={localConfigs}
						clients={clients}
					/>
				</Modal>
			)}

			{showClientManagement && (
				<ClientManagement
					clients={clients}
					currentUser={currentUser}
					localConfigs={localConfigs}
					onCreateClient={onCreateClient}
					onUpdateClient={onUpdateClient}
					onDeleteClient={onDeleteClient}
					onClose={() => setShowClientManagement(false)}
				/>
			)}

			{selectedOrder && (
				<Modal onClose={() => setSelectedOrder(null)} maxWidth="2xl">
					<OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
				</Modal>
			)}

			{showUserManagement && (
				<UserManagement
					users={users}
					onCreateUser={onCreateUser}
					onUpdateUser={onUpdateUser}
					onDeleteUser={onDeleteUser}
					onClose={() => setShowUserManagement(false)}
					localConfigs={localConfigs}
					currentUser={currentUser}
				/>
			)}

			{showLocalSettings && (
				<Modal onClose={() => setShowLocalSettings(false)} maxWidth="xl">
					<LocalSettings
						onClose={() => setShowLocalSettings(false)}
						onSave={handleSaveLocalConfigs}
						initialLocals={localConfigs}
					/>
				</Modal>
			)}
		</div>
	);
}

