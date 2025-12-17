/* ====================================
   QUICK ACTIONS COMPONENT
   ==================================== */

import { Plus, Users, UserCog, Settings } from 'lucide-react';

interface QuickActionsProps {
  isAdmin: boolean;
}

export function QuickActions({ isAdmin }: QuickActionsProps) {
  return (
    <div className="delivery-actions-card">
      <h3 className="delivery-actions-title">Acciones Rápidas</h3>
      <div className="delivery-actions-grid">
        <button className="delivery-action-button">
          <Plus />
          <span className="delivery-action-text">Nuevo Pedido</span>
        </button>
        
        <button className="delivery-action-button secondary">
          <Users />
          <span className="delivery-action-text">Clientes</span>
        </button>
        
        {isAdmin && (
          <>
            <button className="delivery-action-button secondary">
              <UserCog />
              <span className="delivery-action-text">Usuarios</span>
            </button>
            
            <button className="delivery-action-button secondary">
              <Settings />
              <span className="delivery-action-text">Configurar</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
