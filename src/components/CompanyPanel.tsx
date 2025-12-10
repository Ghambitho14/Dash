import { useState, useEffect, useMemo } from 'react';
import { Order, Local } from '../types/order';
import { User } from '../types/user';
import { Client } from '../types/client';
import { CreateOrderForm } from './CreateOrderForm';
import { ClientManagement } from './ClientManagement';
import { OrderList } from './OrderList';
import { OrderDetail } from './company/OrderDetail';
import { LocalSettings } from './LocalSettings';
import { LocalConfig } from '../utils/localConfig';
import { Modal } from './common/Modal';
import { generatePickupCode } from '../utils/codeUtils';
import { Plus, Package, Building2, Store, ChevronDown, Settings, Menu, X, Users } from 'lucide-react';
import './CompanyPanel.css';

interface CompanyPanelProps {
	currentUser: User;
	orders: Order[];
	setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
	localConfigs: LocalConfig[];
	setLocalConfigs: React.Dispatch<React.SetStateAction<LocalConfig[]>>;
	clients: Client[];
	onCreateClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdateClient: (clientId: string, clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onDeleteClient: (clientId: string) => void;
}

export function CompanyPanel({ currentUser, orders, setOrders, localConfigs, setLocalConfigs, clients, onCreateClient, onUpdateClient, onDeleteClient }: CompanyPanelProps) {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showClientManagement, setShowClientManagement] = useState(false);
	const [showLocalSettings, setShowLocalSettings] = useState(false);
	const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
	const [selectedLocal, setSelectedLocal] = useState<Local | 'Todos'>('Todos');
	const [showLocalDropdown, setShowLocalDropdown] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		// Si es usuario local, establecer automáticamente su local
		if (currentUser.role === 'local' && currentUser.local) {
			setSelectedLocal(currentUser.local);
		}
	}, [currentUser]);

	const handleCreateOrder = (orderData: Omit<Order, 'id' | 'companyId' | 'companyName' | 'status' | 'pickupCode' | 'createdAt' | 'updatedAt'>) => {
		const isLocal = currentUser.role === 'local';
		const newOrder: Order = {
			...orderData,
			id: `ORD-${Date.now()}`,
			companyId: isLocal ? currentUser.id : 'company-admin',
			companyName: isLocal ? currentUser.local! : 'Admin',
			status: 'Pendiente',
			pickupCode: generatePickupCode(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		setOrders([newOrder, ...orders]);
		setShowCreateForm(false);
	};

	const handleDeleteOrder = (orderId: string) => {
		if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
			setOrders(orders.filter(order => order.id !== orderId));
			if (selectedOrder?.id === orderId) {
				setSelectedOrder(null);
			}
		}
	};

	const handleSaveLocalConfigs = (configs: LocalConfig[]) => {
		setLocalConfigs(configs);
		// Guardar en localStorage
		localStorage.setItem('localConfigs', JSON.stringify(configs));
	};

  // Filtrar pedidos según rol de usuario
  const userFilteredOrders = useMemo(() => 
    currentUser.role === 'local' && currentUser.local
      ? orders.filter(order => order.local === currentUser.local)
      : orders,
    [orders, currentUser]
  );

  const filteredOrders = useMemo(() => {
    const statusFilter = {
      all: () => true,
      active: (order: Order) => order.status !== 'Entregado',
      completed: (order: Order) => order.status === 'Entregado',
    };

    const localFilter = currentUser.role === 'admin'
      ? (order: Order) => selectedLocal === 'Todos' || order.local === selectedLocal
      : () => true;

    return userFilteredOrders.filter(order => 
      statusFilter[activeTab](order) && localFilter(order)
    );
  }, [userFilteredOrders, activeTab, selectedLocal, currentUser.role]);

	const locales: (Local | 'Todos')[] = ['Todos', ...localConfigs.map(config => config.name as Local)];

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
                  {currentUser.role === 'admin' ? 'Administrador' : 'Local'}
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
          
          {/* Local Selector Dropdown - Solo para admin */}
          {currentUser.role === 'admin' && (
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

          {/* Settings Button - Solo para admin */}
          {currentUser.role === 'admin' && (
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