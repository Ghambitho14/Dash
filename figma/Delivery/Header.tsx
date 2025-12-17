/* ====================================
   DELIVERY HEADER COMPONENT
   ==================================== */

import { Package, Store, ChevronDown, Bell, Settings, LogOut } from 'lucide-react';
import { User } from './types';
import { getInitials, getRoleText } from './utils';

interface HeaderProps {
  currentUser: User;
  selectedLocal: string;
  showLocalDropdown: boolean;
  locales: string[];
  isAdmin: boolean;
  onLocalSelect: (local: string) => void;
  onToggleDropdown: () => void;
}

export function Header({
  currentUser,
  selectedLocal,
  showLocalDropdown,
  locales,
  isAdmin,
  onLocalSelect,
  onToggleDropdown
}: HeaderProps) {
  return (
    <header className="delivery-header">
      <div className="delivery-header-left">
        <div className="delivery-logo">
          <div className="delivery-logo-icon">
            <Package />
          </div>
          <span>DeliveryApp</span>
        </div>
        
        <div className="delivery-header-divider" />
        
        {isAdmin && (
          <div className="delivery-local-selector">
            <button
              className="delivery-local-button"
              onClick={onToggleDropdown}
            >
              <Store />
              <span>{selectedLocal}</span>
              <ChevronDown style={{ 
                transform: showLocalDropdown ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s'
              }} />
            </button>
            
            {showLocalDropdown && (
              <div className="delivery-local-dropdown">
                {locales.map((local) => (
                  <button
                    key={local}
                    className={`delivery-local-option ${selectedLocal === local ? 'active' : ''}`}
                    onClick={() => onLocalSelect(local)}
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
      
      <div className="delivery-header-right">
        <div className="delivery-user-info">
          <div className="delivery-user-avatar">
            {getInitials(currentUser.name)}
          </div>
          <div className="delivery-user-details">
            <div className="delivery-user-name">{currentUser.name}</div>
            <div className="delivery-user-role">
              {getRoleText(currentUser.role)}
            </div>
          </div>
        </div>
        
        <button className="delivery-header-button">
          <Bell />
        </button>
        
        <button className="delivery-header-button">
          <Settings />
        </button>
        
        <button className="delivery-header-button">
          <LogOut />
        </button>
      </div>
    </header>
  );
}
