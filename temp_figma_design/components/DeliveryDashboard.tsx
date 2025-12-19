import { useState, useEffect } from 'react';
import { Package, Home, User as UserIcon, MapPin, TrendingUp, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { Toaster, toast } from 'sonner@2.0.3';
import HomeView from './views/HomeView';
import OrdersView from './views/OrdersView';
import MyOrdersView from './views/MyOrdersView';
import EarningsView from './views/EarningsView';
import ProfileView from './views/ProfileView';
import HistoryView from './views/HistoryView';
import Onboarding from './Onboarding';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

type TabType = 'home' | 'orders' | 'my-orders' | 'earnings' | 'profile' | 'history';

export default function DeliveryDashboard({ userName, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isConnected, setIsConnected] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(3);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_completed');
  });
  const [startX, setStartX] = useState(0);

  // Simulación de notificación de nuevo pedido
  useEffect(() => {
    if (!showOnboarding && isConnected) {
      const timer = setTimeout(() => {
        setNewOrdersCount(prev => prev + 1);
        toast.success('¡Nuevo pedido disponible!', {
          description: 'Pizza Bella - $18.50 - 2.3 km',
          duration: 4000,
        });
        // Simular sonido
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2W47OikSQ0MUKXi8LVjHQU7k9jwyHkqBSl+zO/glEILElyx6OyrWSgLPJnc8sFuJAUrgc7y2Ik3CB1luOznpUsODlKm4u+0Yh0FO5PY8Md4KQUpfszv4ZZGDA9csenoqVMYC0SY2/LAcScFKYDN8dqJNwgaY7ns6KdPCQxPpOLwt2MeBS==');
        audio.play().catch(() => {});
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding, isConnected]);

  const tabs = [
    { id: 'home' as TabType, icon: Home, label: 'Inicio' },
    { id: 'orders' as TabType, icon: Package, label: 'Pedidos', badge: newOrdersCount },
    { id: 'my-orders' as TabType, icon: MapPin, label: 'Activos' },
    { id: 'earnings' as TabType, icon: TrendingUp, label: 'Ganancias' },
    { id: 'profile' as TabType, icon: UserIcon, label: 'Perfil' },
  ];

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleAcceptOrder = () => {
    setNewOrdersCount(prev => Math.max(0, prev - 1));
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 50) {
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      if (diff > 0 && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      } else if (diff < 0 && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].id);
      }
    }
  };

  const renderView = () => {
    const commonProps = { darkMode };
    switch (activeTab) {
      case 'home':
        return <HomeView userName={userName} isConnected={isConnected} onToggleConnection={() => setIsConnected(!isConnected)} onNavigate={handleNavigate} darkMode={darkMode} />;
      case 'orders':
        return <OrdersView onAcceptOrder={handleAcceptOrder} darkMode={darkMode} />;
      case 'my-orders':
        return <MyOrdersView darkMode={darkMode} />;
      case 'earnings':
        return <EarningsView darkMode={darkMode} />;
      case 'history':
        return <HistoryView darkMode={darkMode} />;
      case 'profile':
        return <ProfileView userName={userName} onLogout={onLogout} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onViewHistory={() => setActiveTab('history')} />;
      default:
        return null;
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <>
      <Toaster 
        position="top-center" 
        theme={darkMode ? 'dark' : 'light'}
        richColors
        closeButton
      />
      
      <div 
        style={{
          ...styles.container,
          background: darkMode ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Contenido principal */}
        <main style={styles.main}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </main>

        {/* Bottom Navigation */}
        <nav style={{
          ...styles.bottomNav,
          background: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
        }}>
          <div style={styles.navContent}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                style={styles.navButton}
                className={activeTab === tab.id ? 'nav-active' : 'nav-button'}
              >
                <div style={styles.navIconWrapper}>
                  <tab.icon 
                    style={{
                      ...styles.navIcon,
                      color: activeTab === tab.id ? '#2b73ee' : (darkMode ? '#94a3b8' : '#94a3b8'),
                    }} 
                  />
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      style={styles.activeIndicator}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={styles.badge}
                      className="badge-pulse"
                    >
                      {tab.badge}
                    </motion.div>
                  )}
                </div>
                <span style={{
                  ...styles.navLabel,
                  color: activeTab === tab.id ? '#2b73ee' : (darkMode ? '#94a3b8' : '#94a3b8'),
                  fontWeight: activeTab === tab.id ? 600 : 500,
                }}>
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </nav>
      </div>

      {/* Estilos CSS */}
      <style>{`
        .nav-active .nav-icon-wrapper {
          background: rgba(43, 115, 238, 0.1) !important;
        }

        @keyframes badgePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .badge-pulse {
          animation: badgePulse 2s ease-in-out infinite;
        }

        @media (min-width: 768px) {
          .bottom-nav {
            max-width: 600px;
            margin: 0 auto;
            border-radius: 2rem !important;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 3rem);
            bottom: 1.5rem !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    paddingBottom: '6rem',
    transition: 'background 0.3s ease',
  },

  main: {
    minHeight: 'calc(100vh - 6rem)',
  },

  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backdropFilter: 'blur(20px)',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
    zIndex: 100,
    transition: 'all 0.3s ease',
  },

  navContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0.75rem 0.5rem',
    maxWidth: '100%',
  },

  navButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    transition: 'all 0.2s',
  },

  navIconWrapper: {
    position: 'relative',
    width: '2.75rem',
    height: '2.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1rem',
    transition: 'all 0.2s',
  },

  navIcon: {
    width: '1.5rem',
    height: '1.5rem',
    transition: 'color 0.2s',
    position: 'relative',
    zIndex: 2,
  },

  activeIndicator: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(43, 115, 238, 0.1)',
    borderRadius: '1rem',
    zIndex: 1,
  },

  navLabel: {
    fontSize: '0.75rem',
    transition: 'all 0.2s',
  },

  badge: {
    position: 'absolute',
    top: '-0.25rem',
    right: '-0.25rem',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    fontSize: '0.688rem',
    fontWeight: '700',
    minWidth: '1.25rem',
    height: '1.25rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.375rem',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
    zIndex: 3,
  },
};