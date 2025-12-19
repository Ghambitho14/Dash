import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navigation, Phone, MapPin, User as UserIcon, ExternalLink, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner@2.0.3';

interface MyOrdersViewProps {
  darkMode: boolean;
}

export default function MyOrdersView({ darkMode }: MyOrdersViewProps) {
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutos en segundos

  const currentOrder = {
    id: 4,
    restaurant: 'Taco Loco',
    customer: 'Pedro Martínez',
    address: 'Diagonal 78 #12-34, Suba',
    distance: 0.8,
    payment: 15.80,
    phone: '+57 300 123 4567',
    lat: 4.7262,
    lng: -74.0684,
    status: 'in-progress',
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const callCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#10b981', '#059669', '#34d399'],
    });

    toast.success('¡Entrega Completada!', {
      description: `+$${currentOrder.payment} agregados a tus ganancias`,
      duration: 4000,
    });
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{...styles.title, color: darkMode ? '#f8fafc' : '#0f172a'}}>
            Mi Pedido Activo
          </h1>
          <p style={{...styles.subtitle, color: darkMode ? '#94a3b8' : '#64748b'}}>
            Sigue el progreso de tu entrega
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            ...styles.activeOrderCard,
            background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'white',
          }}
        >
          {/* Timer */}
          <div style={styles.timerContainer}>
            <Clock style={styles.timerIcon} />
            <span style={styles.timerText}>Tiempo restante:</span>
            <motion.span 
              style={{
                ...styles.timerValue,
                color: timeRemaining < 300 ? '#ef4444' : '#10b981',
              }}
              animate={{ scale: timeRemaining < 300 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: timeRemaining < 300 ? Infinity : 0, duration: 1 }}
            >
              {formatTime(timeRemaining)}
            </motion.span>
          </div>

          <div style={styles.activeOrderHeader}>
            <div>
              <span style={styles.activeOrderBadge}>En Curso</span>
              <h3 style={{...styles.activeOrderTitle, color: darkMode ? '#f8fafc' : '#0f172a'}}>
                {currentOrder.restaurant}
              </h3>
            </div>
            <span style={styles.activeOrderPayment}>${currentOrder.payment}</span>
          </div>

          <div style={styles.activeOrderProgress}>
            <div style={styles.progressStep}>
              <div style={{...styles.progressDot, backgroundColor: '#10b981'}} className="progress-dot-complete" />
              <span style={{...styles.progressLabel, color: darkMode ? '#cbd5e1' : '#64748b'}}>Recogido</span>
            </div>
            <div style={{...styles.progressLine, background: darkMode ? '#334155' : '#e5e7eb'}} />
            <div style={styles.progressStep}>
              <div style={{...styles.progressDot, backgroundColor: '#2b73ee'}} className="progress-dot-active" />
              <span style={{...styles.progressLabel, color: darkMode ? '#cbd5e1' : '#64748b'}}>En camino</span>
            </div>
            <div style={{...styles.progressLine, background: darkMode ? '#334155' : '#e5e7eb'}} />
            <div style={styles.progressStep}>
              <div style={{...styles.progressDot, backgroundColor: darkMode ? '#475569' : '#e5e7eb'}} />
              <span style={{...styles.progressLabel, color: darkMode ? '#cbd5e1' : '#64748b'}}>Entregado</span>
            </div>
          </div>

          <div style={{...styles.sectionTitle, color: darkMode ? '#94a3b8' : '#64748b'}}>
            Información del Cliente
          </div>
          <div style={styles.activeOrderDetails}>
            <div style={styles.orderDetail}>
              <UserIcon style={{...styles.orderIcon, color: darkMode ? '#cbd5e1' : '#94a3b8'}} />
              <span style={{color: darkMode ? '#cbd5e1' : '#475569'}}>{currentOrder.customer}</span>
            </div>
            
            <div style={styles.locationWrapper}>
              <div style={styles.orderDetail}>
                <MapPin style={{...styles.orderIcon, color: darkMode ? '#cbd5e1' : '#94a3b8'}} />
                <span style={{color: darkMode ? '#cbd5e1' : '#475569'}}>{currentOrder.address}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openInGoogleMaps(currentOrder.lat, currentOrder.lng)}
                style={styles.mapButton}
                className="map-button"
              >
                <ExternalLink style={styles.mapIcon} />
              </motion.button>
            </div>

            <div style={styles.orderDetail}>
              <Phone style={{...styles.orderIcon, color: darkMode ? '#cbd5e1' : '#94a3b8'}} />
              <span style={{color: darkMode ? '#cbd5e1' : '#475569'}}>{currentOrder.phone}</span>
            </div>
          </div>

          {/* Embedded Map */}
          <div style={styles.mapContainer}>
            <iframe
              style={styles.map}
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${currentOrder.lat},${currentOrder.lng}&zoom=16`}
              title="Ubicación del cliente"
            />
          </div>

          <div style={styles.activeOrderActions}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openInGoogleMaps(currentOrder.lat, currentOrder.lng)}
              style={styles.navigationButton}
            >
              <Navigation style={{width: '1.25rem', height: '1.25rem'}} />
              Navegar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => callCustomer(currentOrder.phone)}
              style={styles.callButton}
            >
              <Phone style={{width: '1.25rem', height: '1.25rem'}} />
              Llamar
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            style={styles.completeButton}
          >
            Marcar como Entregado
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            ...styles.infoCard,
            background: darkMode ? 'rgba(43, 115, 238, 0.1)' : 'linear-gradient(135deg, rgba(43, 115, 238, 0.05) 0%, rgba(82, 138, 244, 0.05) 100%)',
          }}
        >
          <p style={{...styles.infoText, color: darkMode ? '#cbd5e1' : '#475569'}}>
            💡 <strong>Consejo:</strong> Verifica el código de entrega con el cliente antes de marcar como completado.
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        .progress-dot-active {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .progress-dot-complete {
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
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
    marginBottom: '2rem',
  },

  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
  },

  subtitle: {
    fontSize: '0.95rem',
    margin: 0,
  },

  activeOrderCard: {
    borderRadius: '1.75rem',
    padding: '1.75rem',
    border: '2px solid #e0f2fe',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(43, 115, 238, 0.15)',
  },

  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, rgba(43, 115, 238, 0.1) 0%, rgba(82, 138, 244, 0.1) 100%)',
    borderRadius: '1.25rem',
    marginBottom: '1.5rem',
  },

  timerIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#2b73ee',
  },

  timerText: {
    fontSize: '0.938rem',
    fontWeight: '500',
    color: '#64748b',
  },

  timerValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    fontFamily: 'monospace',
  },

  activeOrderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.75rem',
  },

  activeOrderBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #2b73ee 0%, #528af4 100%)',
    color: 'white',
    borderRadius: '2rem',
    fontSize: '0.813rem',
    fontWeight: '600',
    marginBottom: '0.875rem',
  },

  activeOrderTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
  },

  activeOrderPayment: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#10b981',
  },

  activeOrderProgress: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '1.125rem',
  },

  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.625rem',
  },

  progressDot: {
    width: '1.125rem',
    height: '1.125rem',
    borderRadius: '50%',
  },

  progressLabel: {
    fontSize: '0.813rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  progressLine: {
    flex: 1,
    height: '2px',
    margin: '0 0.75rem',
    marginBottom: '1.875rem',
  },

  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  },

  activeOrderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },

  orderDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    fontSize: '0.938rem',
  },

  orderIcon: {
    width: '1.25rem',
    height: '1.25rem',
    flexShrink: 0,
  },

  locationWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    justifyContent: 'space-between',
  },

  mapButton: {
    padding: '0.625rem',
    background: 'rgba(43, 115, 238, 0.1)',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  mapIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#2b73ee',
  },

  mapContainer: {
    width: '100%',
    height: '250px',
    borderRadius: '1.125rem',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  },

  map: {
    width: '100%',
    height: '100%',
    border: 'none',
  },

  activeOrderActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.25rem',
  },

  navigationButton: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #035ce8 0%, #2b73ee 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '1.125rem',
    fontSize: '0.938rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
  },

  callButton: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '1.125rem',
    fontSize: '0.938rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
  },

  completeButton: {
    width: '100%',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '1.25rem',
    fontSize: '1.063rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
  },

  infoCard: {
    padding: '1.25rem',
    borderRadius: '1.125rem',
    border: '1px solid rgba(43, 115, 238, 0.1)',
  },

  infoText: {
    fontSize: '0.875rem',
    margin: 0,
    lineHeight: '1.6',
  },
};
