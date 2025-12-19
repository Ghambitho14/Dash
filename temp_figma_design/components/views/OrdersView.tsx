import { useState } from 'react';
import { motion } from 'motion/react';
import { Navigation, Clock, MapPin, User as UserIcon, ExternalLink, Filter, ArrowUpDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner@2.0.3';

interface OrdersViewProps {
  onAcceptOrder: () => void;
  darkMode: boolean;
}

export default function OrdersView({ onAcceptOrder, darkMode }: OrdersViewProps) {
  const [sortBy, setSortBy] = useState<'distance' | 'payment' | 'time'>('distance');
  const [showFilters, setShowFilters] = useState(false);

  const mockOrders = [
    {
      id: 1,
      restaurant: 'Pizza Bella',
      customer: 'María González',
      address: 'Av. Principal #123, Centro',
      distance: 2.3,
      payment: 18.50,
      time: 25,
      lat: 4.6533,
      lng: -74.0836,
    },
    {
      id: 2,
      restaurant: 'Burger House',
      customer: 'Carlos Ruiz',
      address: 'Calle 45 #67-89, Chapinero',
      distance: 1.8,
      payment: 22.00,
      time: 20,
      lat: 4.6497,
      lng: -74.0628,
    },
    {
      id: 3,
      restaurant: 'Sushi Express',
      customer: 'Ana López',
      address: 'Carrera 15 #34-56, Teusaquillo',
      distance: 3.5,
      payment: 31.20,
      time: 30,
      lat: 4.6382,
      lng: -74.0837,
    },
    {
      id: 4,
      restaurant: 'Tacos al Pastor',
      customer: 'Juan Pérez',
      address: 'Calle 85 #15-20, Usaquén',
      distance: 4.2,
      payment: 16.80,
      time: 35,
      lat: 4.6738,
      lng: -74.0305,
    },
  ];

  const sortedOrders = [...mockOrders].sort((a, b) => {
    if (sortBy === 'distance') return a.distance - b.distance;
    if (sortBy === 'payment') return b.payment - a.payment;
    if (sortBy === 'time') return a.time - b.time;
    return 0;
  });

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleAccept = (order: typeof mockOrders[0]) => {
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#035ce8', '#2b73ee', '#528af4', '#10b981'],
    });

    toast.success('¡Pedido Aceptado!', {
      description: `${order.restaurant} - ${order.customer}`,
      duration: 3000,
    });

    onAcceptOrder();
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{...styles.title, color: darkMode ? '#f8fafc' : '#0f172a'}}>
              Pedidos Disponibles
            </h1>
            <p style={{...styles.subtitle, color: darkMode ? '#94a3b8' : '#64748b'}}>
              Selecciona un pedido para comenzar
            </p>
          </div>

          {/* Sort/Filter Controls */}
          <div style={styles.controls}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                ...styles.controlButton,
                background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'white',
                color: darkMode ? '#f8fafc' : '#0f172a',
              }}
              className="control-button"
            >
              <ArrowUpDown style={styles.controlIcon} />
            </motion.button>
          </div>
        </div>

        {/* Sort Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              ...styles.sortContainer,
              background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'white',
            }}
          >
            {[
              { value: 'distance', label: 'Más Cerca' },
              { value: 'payment', label: 'Mayor Pago' },
              { value: 'time', label: 'Menos Tiempo' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSortBy(option.value as any);
                  setShowFilters(false);
                }}
                style={{
                  ...styles.sortOption,
                  background: sortBy === option.value ? 'rgba(43, 115, 238, 0.1)' : 'transparent',
                  color: sortBy === option.value ? '#2b73ee' : (darkMode ? '#cbd5e1' : '#475569'),
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div style={styles.ordersContainer}>
          {sortedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              style={{
                ...styles.orderCard,
                background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'white',
              }}
              className="order-card"
            >
              <div style={styles.orderHeader}>
                <h3 style={{...styles.orderRestaurant, color: darkMode ? '#f8fafc' : '#0f172a'}}>
                  {order.restaurant}
                </h3>
                <span style={styles.orderPayment}>${order.payment.toFixed(2)}</span>
              </div>
              
              <div style={styles.orderDetails}>
                <div style={styles.orderDetail}>
                  <UserIcon style={{...styles.orderIcon, color: darkMode ? '#cbd5e1' : '#94a3b8'}} />
                  <span style={{color: darkMode ? '#cbd5e1' : '#475569'}}>{order.customer}</span>
                </div>
                
                <div style={styles.locationWrapper}>
                  <div style={styles.orderDetail}>
                    <MapPin style={{...styles.orderIcon, color: darkMode ? '#cbd5e1' : '#94a3b8'}} />
                    <span style={{color: darkMode ? '#cbd5e1' : '#475569'}}>{order.address}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openInGoogleMaps(order.lat, order.lng)}
                    style={styles.mapButton}
                    className="map-button"
                    title="Abrir en Google Maps"
                  >
                    <ExternalLink style={styles.mapIcon} />
                  </motion.button>
                </div>

                <div style={styles.orderMetrics}>
                  <div style={{
                    ...styles.orderMetric,
                    background: darkMode ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
                    color: darkMode ? '#cbd5e1' : '#475569',
                  }}>
                    <Navigation style={styles.metricIcon} />
                    <span>{order.distance} km</span>
                  </div>
                  <div style={{
                    ...styles.orderMetric,
                    background: darkMode ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
                    color: darkMode ? '#cbd5e1' : '#475569',
                  }}>
                    <Clock style={styles.metricIcon} />
                    <span>{order.time} min</span>
                  </div>
                </div>
              </div>

              {/* Embedded Mini Map */}
              <div style={styles.miniMapContainer}>
                <iframe
                  style={styles.miniMap}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${order.lat},${order.lng}&zoom=15`}
                  title={`Mapa de ${order.address}`}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccept(order)}
                style={styles.acceptButton}
                className="accept-button"
              >
                Aceptar Pedido
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .order-card:hover {
          box-shadow: 0 10px 30px rgba(43, 115, 238, 0.2) !important;
        }

        .accept-button:hover {
          background: linear-gradient(135deg, #2b73ee 0%, #528af4 100%) !important;
          box-shadow: 0 8px 25px rgba(43, 115, 238, 0.4) !important;
        }

        .map-button:hover {
          background: rgba(43, 115, 238, 0.2) !important;
        }

        .control-button:hover {
          transform: scale(1.05);
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
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
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

  controls: {
    display: 'flex',
    gap: '0.5rem',
  },

  controlButton: {
    padding: '0.75rem',
    borderRadius: '1rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },

  controlIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },

  sortContainer: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },

  sortOption: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  ordersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  orderCard: {
    borderRadius: '1.5rem',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s',
  },

  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },

  orderRestaurant: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
  },

  orderPayment: {
    fontSize: '1.375rem',
    fontWeight: '700',
    color: '#10b981',
  },

  orderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    marginBottom: '1rem',
  },

  orderDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
    padding: '0.5rem',
    background: 'rgba(43, 115, 238, 0.1)',
    border: 'none',
    borderRadius: '0.625rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  mapIcon: {
    width: '1.125rem',
    height: '1.125rem',
    color: '#2b73ee',
  },

  orderMetrics: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },

  orderMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '0.875rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  metricIcon: {
    width: '1.125rem',
    height: '1.125rem',
    color: '#2b73ee',
  },

  miniMapContainer: {
    width: '100%',
    height: '180px',
    borderRadius: '1rem',
    overflow: 'hidden',
    marginBottom: '1rem',
  },

  miniMap: {
    width: '100%',
    height: '100%',
    border: 'none',
  },

  acceptButton: {
    width: '100%',
    padding: '1.125rem',
    background: 'linear-gradient(135deg, #035ce8 0%, #2b73ee 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '1.125rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(3, 92, 232, 0.3)',
  },
};