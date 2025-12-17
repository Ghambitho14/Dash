/* ====================================
   STATS GRID COMPONENT
   ==================================== */

import { Package, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Stats } from './types';

interface StatsGridProps {
  stats: Stats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="delivery-stats-grid">
      <div className="delivery-stat-card blue">
        <div className="delivery-stat-header">
          <span className="delivery-stat-label">Total de Pedidos</span>
          <div className="delivery-stat-icon">
            <Package />
          </div>
        </div>
        <div className="delivery-stat-value">{stats.total}</div>
        <div className="delivery-stat-change positive">
          <TrendingUp />
          <span>+12% desde ayer</span>
        </div>
      </div>

      <div className="delivery-stat-card orange">
        <div className="delivery-stat-header">
          <span className="delivery-stat-label">Pendientes</span>
          <div className="delivery-stat-icon">
            <Clock />
          </div>
        </div>
        <div className="delivery-stat-value">{stats.pending}</div>
        <div className="delivery-stat-change negative">
          <TrendingDown />
          <span>-3% desde ayer</span>
        </div>
      </div>

      <div className="delivery-stat-card blue">
        <div className="delivery-stat-header">
          <span className="delivery-stat-label">En Progreso</span>
          <div className="delivery-stat-icon">
            <Package />
          </div>
        </div>
        <div className="delivery-stat-value">{stats.inProgress}</div>
        <div className="delivery-stat-change positive">
          <TrendingUp />
          <span>+8% desde ayer</span>
        </div>
      </div>

      <div className="delivery-stat-card green">
        <div className="delivery-stat-header">
          <span className="delivery-stat-label">Completados</span>
          <div className="delivery-stat-icon">
            <Package />
          </div>
        </div>
        <div className="delivery-stat-value">{stats.completed}</div>
        <div className="delivery-stat-change positive">
          <TrendingUp />
          <span>+15% desde ayer</span>
        </div>
      </div>
    </div>
  );
}
