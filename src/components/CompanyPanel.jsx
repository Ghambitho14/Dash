import { CreateOrderForm } from './CreateOrderForm';
import { ClientManagement } from './ClientManagement';
import { UserManagement } from './UserManagement';
import { OrderList } from './OrderList';
import { OrderDetail } from './OrderDetail';
import { LocalSettings } from './LocalSettings';
import { Modal } from './Modal';
import { useCompanyPanel } from '../hooks/useCompanyPanel';
import { isAdminOrEmpresarial, getRoleName } from '../utils/utils';
import { Plus, Package, Building2, Store, ChevronDown, Settings, Menu, X, Users, UserCog } from 'lucide-react';
import '../styles/Components/CompanyPanel.css';

export function CompanyPanel({ currentUser, orders, setOrders, onReloadOrders, localConfigs, setLocalConfigs, clients, onCreateClient, onUpdateClient, onDeleteClient, users, onCreateUser, onUpdateUser, onDeleteUser }) {
	const {
		selectedOrder,
		showCreateForm,
		showClientManagement,
		showUserManagement,
		showLocalSettings,
		activeTab,
		selectedLocal,
		showLocalDropdown,
		sidebarOpen,
		userFilteredOrders,
		filteredOrders,
		locales,
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
	} = useCompanyPanel(currentUser, orders, setOrders, localConfigs, setLocalConfigs);

	const handleCreateOrderWrapper = async (orderData) => {
		try {
			await handleCreateOrder(orderData, clients);
		} catch (err) {
			alert(err.message);
		}
	};

	const handleDeleteOrderWrapper = async (orderId) => {
		if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
			return;
		}
		try {
			await handleDeleteOrder(orderId);
		} catch (err) {
			alert(err.message);
		}
	};

	const handleSaveLocalConfigsWrapper = async (configs) => {
		try {
			await handleSaveLocalConfigs(configs);
		} catch (err) {
			alert(err.message);
		}
	};

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
						onDeleteOrder={handleDeleteOrderWrapper}
					/>
				</div>
			</div>


			{/* Modals */}
			{showCreateForm && (
				<Modal onClose={() => setShowCreateForm(false)} maxWidth="2xl">
					<CreateOrderForm
						onSubmit={handleCreateOrderWrapper}
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
						onSave={handleSaveLocalConfigsWrapper}
						initialLocals={localConfigs}
					/>
				</Modal>
			)}
		</div>
	);
}

