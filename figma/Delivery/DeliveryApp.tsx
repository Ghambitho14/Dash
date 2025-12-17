/* ====================================
   DELIVERY APP - COMPONENTE PRINCIPAL
   ==================================== */

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { User, TabType } from './types';
import { mockOrders } from './mockData';

// Importar estilos
import '../../styles/Components/Variables.css';
import '../../styles/Components/DeliveryLayout.css';
import '../../styles/Components/DeliveryHeader.css';
import '../../styles/Components/DeliverySidebar.css';
import '../../styles/Components/DeliveryMain.css';
import '../../styles/Components/OrderCard.css';

export function DeliveryApp() {
  const [currentUser] = useState<User>({
    name: 'Juan Pérez',
    role: 'admin',
    local: 'Local 1'
  });

  const [selectedLocal, setSelectedLocal] = useState('Todos');
  const [showLocalDropdown, setShowLocalDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const locales = ['Todos', 'Local 1', 'Local 2', 'Local 3', 'Local 4'];
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'empresarial';

  // Filtrar órdenes
  const filteredOrders = mockOrders.filter(order => {
    // Filtrar por local
    if (selectedLocal !== 'Todos' && order.local !== selectedLocal) return false;
    
    // Filtrar por tab
    if (activeTab === 'active' && order.status === 'completed') return false;
    if (activeTab === 'completed' && order.status !== 'completed') return false;
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(search) ||
        order.clientName.toLowerCase().includes(search) ||
        order.clientPhone.includes(search)
      );
    }
    
    return true;
  });

  // Calcular estadísticas
  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    inProgress: mockOrders.filter(o => o.status === 'in-progress').length,
    completed: mockOrders.filter(o => o.status === 'completed').length
  };

  const handleLocalSelect = (local: string) => {
    setSelectedLocal(local);
    setShowLocalDropdown(false);
  };

  const handleToggleDropdown = () => {
    setShowLocalDropdown(!showLocalDropdown);
  };

  return (
    <div className="delivery-app">
      <Header
        currentUser={currentUser}
        selectedLocal={selectedLocal}
        showLocalDropdown={showLocalDropdown}
        locales={locales}
        isAdmin={isAdmin}
        onLocalSelect={handleLocalSelect}
        onToggleDropdown={handleToggleDropdown}
      />

      <div className="delivery-container">
        <Sidebar isAdmin={isAdmin} stats={stats} />
        
        <MainContent
          activeTab={activeTab}
          searchTerm={searchTerm}
          stats={stats}
          filteredOrders={filteredOrders}
          onTabChange={setActiveTab}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
}
