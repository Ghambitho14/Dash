import { CreateOrderForm } from '../orders/CreateOrderForm';
import { ClientManagement } from '../clients/ClientManagement';
import { UserManagement } from '../users/UserManagement';
import { OrderList } from '../orders/OrderList';
import { OrderDetail } from '../orders/OrderDetail';
import { LocalSettings } from '../locals/LocalSettings';
import { TrackingPanel } from '../tracking/TrackingPanel';
import { Modal } from '../ui/Modal';
import { useCompanyPanel } from '../../hooks/useCompanyPanel';
import { isAdminOrEmpresarial, getRoleName, getInitials } from '../../utils/utils';
import { Package, Store, ChevronDown, Settings, Bell, LogOut, Search, Clock, Menu, X, Building2, Users, UserCog, Plus, Navigation } from 'lucide-react';
import { logger } from '../../utils/logger';
import '../../styles/Components/CompanyPanel.css';
import '../../styles/Components/SettingsModal.css';

export function CompanyPanel({ currentUser, orders, setOrders, onReloadOrders, localConfigs, setLocalConfigs, clients, onCreateClient, onUpdateClient, onDeleteClient, users, onCreateUser, onUpdateUser, onDeleteUser, onCreateOrder, onDeleteOrder, onSaveLocalConfigs, onLogout }) {
	const {
		selectedOrder,
		showCreateForm,
		showClientManagement,
		showUserManagement,
		showLocalSettings,
		showSettingsModal,
		activeTab,
		selectedLocal,
		showLocalDropdown,
		sidebarOpen,
		showTrackingPanel,
		userFilteredOrders,
		filteredOrders,
		locales,
		setSelectedOrder,
		setShowCreateForm,
		setShowClientManagement,
		setShowUserManagement,
		setShowLocalSettings,
		setShowSettingsModal,
		setActiveTab,
		setSelectedLocal,
		setShowLocalDropdown,
		setSidebarOpen,
		setShowTrackingPanel,
		handleCreateOrder,
		handleDeleteOrder,
		handleSaveLocalConfigs,
	} = useCompanyPanel(currentUser, orders, setOrders, localConfigs, setLocalConfigs, onCreateOrder, onDeleteOrder, onSaveLocalConfigs);

	const handleCreateOrderWrapper = (orderData) => handleCreateOrder(orderData, clients);
	const handleDeleteOrderWrapper = handleDeleteOrder;
	const handleSaveLocalConfigsWrapper = handleSaveLocalConfigs;

	return (
		<div className="panel-empresa">
			{/* Header Superior - Diseño Figma */}
			<header className="encabezado-superior-empresa">
				<div className="encabezado-superior-empresa-izquierda">
					{/* Botón Hamburguesa - Solo móvil */}
					<button
						className="boton-hamburguesa-empresa"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						aria-label="Abrir menú"
					>
						<Menu />
					</button>
					
					<div className="logo-empresa">
						<div className="logo-icono-empresa">
							<Package />
						</div>
						<span>DeliveryApp</span>
					</div>
					
					<div className="divisor-encabezado-empresa" />
					
					{isAdminOrEmpresarial(currentUser.role) && (
						<div className="selector-local-encabezado-empresa">
							<button
								className="boton-local-encabezado-empresa"
								onClick={() => setShowLocalDropdown(!showLocalDropdown)}
							>
								<Store />
								<span>{selectedLocal}</span>
								<ChevronDown style={{ 
									transform: showLocalDropdown ? 'rotate(180deg)' : 'rotate(0)',
									transition: 'transform 0.2s'
								}} />
							</button>
							
							{showLocalDropdown && (
								<div className="menu-local-encabezado-empresa">
									{locales.map((local) => (
										<button
											key={local}
											className={`opcion-local-encabezado-empresa ${selectedLocal === local ? 'activa' : ''}`}
											onClick={() => {
												setSelectedLocal(local);
												setShowLocalDropdown(false);
											}}
										>
											<Store size={16} />
											{local}
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>
				
				<div className="encabezado-superior-empresa-derecha">
					<div className="info-usuario-encabezado-empresa">
						<div className="avatar-usuario-encabezado-empresa">
							{getInitials(currentUser.name)}
						</div>
						<div className="detalles-usuario-encabezado-empresa">
							<div className="nombre-usuario-encabezado-empresa">{currentUser.name}</div>
							<div className="rol-usuario-encabezado-empresa">{getRoleName(currentUser.role)}</div>
						</div>
					</div>
					
					<button 
						className="boton-encabezado-empresa" 
						title="Notificaciones"
						onClick={() => {
							// TODO: Implementar notificaciones
							logger.log('Notificaciones');
						}}
					>
						<Bell />
					</button>
					
					{isAdminOrEmpresarial(currentUser.role) && (
						<button 
							className="boton-encabezado-empresa" 
							title="Configuración"
							onClick={() => setShowSettingsModal(true)}
						>
							<Settings />
						</button>
					)}
					
					<button 
						className="boton-encabezado-empresa" 
						onClick={onLogout}
						title="Salir"
					>
						<LogOut />
					</button>
				</div>
			</header>

			{/* Overlay para móvil */}
			{sidebarOpen && (
				<div 
					className="superposicion-empresa"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Container */}
			<div className="contenedor-empresa">
				{/* Sidebar - Diseño Figma: Solo StatsGrid */}
				<aside className={`barra-lateral-empresa ${sidebarOpen ? 'barra-lateral-empresa-abierta' : ''}`}>
					{/* Botón Cerrar - Solo móvil */}
					<button
						className="cerrar-barra-lateral-empresa"
						onClick={() => setSidebarOpen(false)}
						aria-label="Cerrar menú"
					>
						<X />
					</button>
					
					{/* Selector de Local - Solo móvil y solo para admin/empresarial */}
					{isAdminOrEmpresarial(currentUser.role) && (
						<div className="selector-local-sidebar-mobile">
							<label className="selector-local-sidebar-mobile-label">Seleccionar Local</label>
							<div className="selector-local-sidebar-mobile-dropdown">
								<button
									className="boton-local-sidebar-mobile"
									onClick={() => setShowLocalDropdown(!showLocalDropdown)}
								>
									<Store />
									<span>{selectedLocal}</span>
									<ChevronDown style={{ 
										transform: showLocalDropdown ? 'rotate(180deg)' : 'rotate(0)',
										transition: 'transform 0.2s'
									}} />
								</button>
								
								{showLocalDropdown && (
									<div className="menu-local-sidebar-mobile">
										{locales.map((local) => (
											<button
												key={local}
												className={`opcion-local-sidebar-mobile ${selectedLocal === local ? 'activa' : ''}`}
												onClick={() => {
													setSelectedLocal(local);
													setShowLocalDropdown(false);
												}}
											>
												<Store size={16} />
												{local}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					)}
					
					{/* Estadísticas */}
					<div className="delivery-stats-grid">
						<div className="delivery-stat-card blue">
							<div className="delivery-stat-header">
								<span className="delivery-stat-label">Total de Pedidos</span>
								<div className="delivery-stat-icon">
									<Package />
								</div>
							</div>
							<div className="delivery-stat-value">{userFilteredOrders.length}</div>
						</div>

						<div className="delivery-stat-card orange">
							<div className="delivery-stat-header">
								<span className="delivery-stat-label">Pendientes</span>
								<div className="delivery-stat-icon">
									<Clock />
								</div>
							</div>
							<div className="delivery-stat-value">{userFilteredOrders.filter(o => o.status === 'Pendiente').length}</div>
						</div>

						<div className="delivery-stat-card blue">
							<div className="delivery-stat-header">
								<span className="delivery-stat-label">En Progreso</span>
								<div className="delivery-stat-icon">
									<Package />
								</div>
							</div>
							<div className="delivery-stat-value">
								{userFilteredOrders.filter(o => o.status !== 'Pendiente' && o.status !== 'Entregado').length}
							</div>
						</div>

						<div className="delivery-stat-card green">
							<div className="delivery-stat-header">
								<span className="delivery-stat-label">Completados</span>
								<div className="delivery-stat-icon">
									<Package />
								</div>
							</div>
							<div className="delivery-stat-value">{userFilteredOrders.filter(o => o.status === 'Entregado').length}</div>
						</div>
					</div>
				</aside>

				{/* Main Content - Diseño Figma */}
				<main className="delivery-main">
					{/* Header del Main */}
					<div className="delivery-main-header">
						<div className="delivery-main-title-row">
							<h2 className="delivery-main-title">Panel de Pedidos</h2>
							
							<div className="delivery-main-actions">
								<button
									onClick={() => setShowCreateForm(true)}
									className="delivery-button-primary"
									title="Crear nuevo pedido"
								>
									<Plus size={20} />
									<span>Nuevo Pedido</span>
								</button>
								
								<div className="delivery-search-bar">
									<Search className="delivery-search-icon" />
									<input
										type="text"
										className="delivery-search-input"
										placeholder="Buscar pedidos..."
									/>
								</div>
							</div>
						</div>

						{/* Tabs */}
						<div className="delivery-tabs">
							<button
								onClick={() => {
									setActiveTab('active');
									setShowTrackingPanel(false);
								}}
								className={`delivery-tab ${activeTab === 'active' && !showTrackingPanel ? 'active' : ''}`}
							>
								Activos ({userFilteredOrders.filter(o => o.status !== 'Entregado').length})
							</button>
							<button
								onClick={() => {
									setActiveTab('completed');
									setShowTrackingPanel(false);
								}}
								className={`delivery-tab ${activeTab === 'completed' && !showTrackingPanel ? 'active' : ''}`}
							>
								Completados ({userFilteredOrders.filter(o => o.status === 'Entregado').length})
							</button>
							<button
								onClick={() => {
									setShowTrackingPanel(true);
									setActiveTab(null);
								}}
								className={`delivery-tab ${showTrackingPanel ? 'active' : ''}`}
							>
								<Navigation style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
								Trackeo
							</button>
						</div>
					</div>

					{/* Orders List o Panel de Trackeo */}
					{showTrackingPanel ? (
						<div className="delivery-orders-container">
							<TrackingPanel 
								orders={userFilteredOrders.filter(order => order.status !== 'Entregado')}
								onSelectOrder={setSelectedOrder}
							/>
						</div>
					) : (
						<div className="delivery-orders-container">
							<div className="delivery-orders-grid">
								<OrderList 
									orders={filteredOrders} 
									onSelectOrder={setSelectedOrder}
									onDeleteOrder={handleDeleteOrderWrapper}
								/>
							</div>
						</div>
					)}
				</main>
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

			{showSettingsModal && (
				<Modal onClose={() => setShowSettingsModal(false)} maxWidth="md">
					<div className="modal-configuracion">
						<h2 className="modal-configuracion-titulo">Configuración</h2>
						<div className="modal-configuracion-grid">
							<button
								className="modal-configuracion-item"
								onClick={() => {
									setShowSettingsModal(false);
									setShowLocalSettings(true);
								}}
							>
								<div className="modal-configuracion-icono modal-configuracion-icono-blue">
									<Building2 />
								</div>
								<div className="modal-configuracion-contenido">
									<h3 className="modal-configuracion-nombre">Locales</h3>
									<p className="modal-configuracion-descripcion">Gestionar locales y sucursales</p>
								</div>
							</button>

							<button
								className="modal-configuracion-item"
								onClick={() => {
									setShowSettingsModal(false);
									setShowUserManagement(true);
								}}
							>
								<div className="modal-configuracion-icono modal-configuracion-icono-purple">
									<UserCog />
								</div>
								<div className="modal-configuracion-contenido">
									<h3 className="modal-configuracion-nombre">Usuarios</h3>
									<p className="modal-configuracion-descripcion">Gestionar usuarios empresariales</p>
								</div>
							</button>

							<button
								className="modal-configuracion-item"
								onClick={() => {
									setShowSettingsModal(false);
									setShowClientManagement(true);
								}}
							>
								<div className="modal-configuracion-icono modal-configuracion-icono-green">
									<Users />
								</div>
								<div className="modal-configuracion-contenido">
									<h3 className="modal-configuracion-nombre">Clientes</h3>
									<p className="modal-configuracion-descripcion">Gestionar clientes</p>
								</div>
							</button>
						</div>
					</div>
				</Modal>
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

