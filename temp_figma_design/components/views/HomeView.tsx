import { motion } from 'motion/react';
import { Zap, Package, PackageOpen, PackageCheck } from 'lucide-react';

interface HomeViewProps {
  userName: string;
  isConnected: boolean;
  onToggleConnection: () => void;
  onNavigate: (tab: 'orders' | 'my-orders' | 'earnings') => void;
  darkMode: boolean;
}

export default function HomeView({ userName, isConnected, onToggleConnection, onNavigate, darkMode }: HomeViewProps) {
  const stats = [
    {
      icon: Package,
      label: 'Disponibles',
      count: 3,
      bgColor: 'linear-gradient(135deg, #528af4 0%, #7aa1f9 100%)',
      iconBg: 'rgba(82, 138, 244, 0.15)',
      color: '#528af4',
      navigateTo: 'orders' as const,
    },
    {
      icon: PackageOpen,
      label: 'En Curso',
      count: 1,
      bgColor: 'linear-gradient(135deg, #2b73ee 0%, #528af4 100%)',
      iconBg: 'rgba(43, 115, 238, 0.15)',
      color: '#2b73ee',
      navigateTo: 'my-orders' as const,
    },
    {
      icon: PackageCheck,
      label: 'Completados Hoy',
      count: 12,
      bgColor: 'linear-gradient(135deg, #035ce8 0%, #2b73ee 100%)',
      iconBg: 'rgba(3, 92, 232, 0.15)',
      color: '#035ce8',
      navigateTo: 'earnings' as const,
    },
  ];

  return (
    <>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>Hola,</p>
            <h1 style={styles.name}>{userName}</h1>
          </div>

          {/* Estado de conexión */}
          <motion.button
            onClick={onToggleConnection}
            style={styles.connectionWrapper}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="connection-button"
          >
            {isConnected ? (
              <div style={styles.statusConnected} className="status-connected">
                <div style={{...styles.radarPulse, animationDelay: '0s'}} className="radar-pulse"></div>
                <div style={{...styles.radarPulse, animationDelay: '0.6s'}} className="radar-pulse"></div>
                <div style={{...styles.radarPulse, animationDelay: '1.2s'}} className="radar-pulse"></div>
                
                <div style={styles.iconWrapper} className="icon-glow">
                  <Zap style={styles.zapIcon} className="zap-icon" />
                </div>
                
                <span style={styles.statusText}>En línea</span>
                <div style={styles.statusDot} className="status-dot"></div>
              </div>
            ) : (
              <div style={styles.statusDisconnected}>
                <div style={styles.iconWrapperOffline}>
                  <Zap style={styles.zapIcon} />
                </div>
                <span style={styles.statusText}>Desconectado</span>
              </div>
            )}
          </motion.button>
        </div>

        {/* Cards de estadísticas */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(stat.navigateTo)}
              style={styles.statCard}
              className="stat-card"
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: stat.bgColor,
                  opacity: 0.05,
                  transition: 'opacity 0.3s',
                }}
                className="stat-bg"
              />

              <div style={styles.statContent}>
                <div style={styles.statInfo}>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    style={{
                      ...styles.statIconContainer,
                      backgroundColor: stat.iconBg,
                    }}
                  >
                    <stat.icon style={{...styles.statIcon, color: stat.color}} />
                  </motion.div>
                  <div>
                    <p style={styles.statLabel}>{stat.label}</p>
                    <motion.p
                      key={stat.count}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={styles.statCount}
                    >
                      {stat.count}
                    </motion.p>
                  </div>
                </div>

                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '0.25rem',
                    borderRadius: '0.25rem 0 0 0.25rem',
                    background: stat.bgColor,
                    transformOrigin: 'top',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estilos CSS */}
      <style>{`
        @keyframes radarPulse {
          0% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) scale(3.5);
            opacity: 0;
          }
        }
        
        @keyframes zapPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.85);
          }
        }

        .radar-pulse {
          animation: radarPulse 2s ease-out infinite;
        }

        .zap-icon {
          animation: zapPulse 2s ease-in-out infinite;
        }

        .status-dot {
          animation: pulse 2s ease-in-out infinite;
        }

        .stat-card {
          cursor: pointer;
        }

        .stat-card:hover .stat-bg {
          opacity: 0.1 !important;
        }

        .stat-card:active {
          transform: scale(0.98);
        }

        @media (min-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem 1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },

  greeting: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '0.25rem',
    fontWeight: '500',
  },

  name: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'capitalize',
    margin: 0,
  },

  connectionWrapper: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },

  statusConnected: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem 1.125rem',
    borderRadius: '2rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
    transition: 'all 0.3s ease',
  },

  statusDisconnected: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem 1.125rem',
    borderRadius: '2rem',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  },

  radarPulse: {
    position: 'absolute',
    left: '0.625rem',
    top: '50%',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.4)',
    pointerEvents: 'none',
  },

  iconWrapper: {
    position: 'relative',
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.25)',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
    zIndex: 1,
  },

  iconWrapperOffline: {
    position: 'relative',
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    zIndex: 1,
  },

  zapIcon: {
    width: '1rem',
    height: '1rem',
    color: 'white',
    filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))',
  },

  statusText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    zIndex: 1,
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },

  statusDot: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.5)',
    zIndex: 1,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
  },

  statCard: {
    position: 'relative',
    overflow: 'hidden',
    background: 'white',
    borderRadius: '1.5rem',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  statContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },

  statIconContainer: {
    width: '3rem',
    height: '3rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },

  statIcon: {
    width: '1.5rem',
    height: '1.5rem',
  },

  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '0.25rem',
    margin: '0 0 0.25rem 0',
  },

  statCount: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
};