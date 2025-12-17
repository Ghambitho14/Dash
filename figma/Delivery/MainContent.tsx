/* ====================================
   MAIN CONTENT COMPONENT
   ==================================== */

import { Search } from 'lucide-react';
import { Order, Stats, TabType } from './types';
import { OrderCard } from './OrderCard';

interface MainContentProps {
  activeTab: TabType;
  searchTerm: string;
  stats: Stats;
  filteredOrders: Order[];
  onTabChange: (tab: TabType) => void;
  onSearchChange: (value: string) => void;
}

export function MainContent({
  activeTab,
  searchTerm,
  stats,
  filteredOrders,
  onTabChange,
  onSearchChange
}: MainContentProps) {
  return (
    <main className="delivery-main">
      {/* Header */}
      <div className="delivery-main-header">
        <div className="delivery-main-title-row">
          <h2 className="delivery-main-title">Panel de Pedidos</h2>
          
          <div className="delivery-search-bar">
            <Search className="delivery-search-icon" />
            <input
              type="text"
              className="delivery-search-input"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="delivery-tabs">
          <button
            className={`delivery-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            Todos ({stats.total})
          </button>
          <button
            className={`delivery-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => onTabChange('active')}
          >
            Activos ({stats.pending + stats.inProgress})
          </button>
          <button
            className={`delivery-tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => onTabChange('completed')}
          >
            Completados ({stats.completed})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="delivery-orders-container">
        <div className="delivery-orders-grid">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </main>
  );
}
