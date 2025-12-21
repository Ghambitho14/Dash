import { motion } from 'framer-motion';
import { Zap, LogOut, MessageCircle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/Components/DriverHeader.css';

export function DriverHeader({ isConnected, onToggleConnection, driverName, hasActiveOrders, onLogout, onSupportClick, unreadSupportCount = 0 }) {
	const handleToggleConnection = () => {
		// Si intenta desconectarse y tiene pedidos activos, bloquear
		if (isConnected && hasActiveOrders) {
			toast.error('No puedes desconectarte mientras tienes pedidos activos', {
				duration: 3000,
			});
			return;
		}

		onToggleConnection();
	};

	return (
		<header className="driver-header">
			<div className="driver-header-content">
				<div className="driver-header-left">
					<h1 className="driver-header-title">{driverName || 'Repartidor'}</h1>
				</div>

				<div className="driver-header-right">
					{/* Estado de conexión */}
					<motion.button
						onClick={handleToggleConnection}
						className={`driver-header-connection-wrapper ${isConnected && hasActiveOrders ? 'driver-header-connection-locked' : ''}`}
						whileTap={{ scale: 0.95 }}
						whileHover={isConnected && hasActiveOrders ? {} : { scale: 1.02 }}
						title={isConnected && hasActiveOrders ? 'No puedes desconectarte con pedidos activos' : ''}
					>
						{isConnected ? (
							<div className="driver-header-status-connected">
								<div className="driver-header-radar-pulse" style={{ animationDelay: '0s' }}></div>
								<div className="driver-header-radar-pulse" style={{ animationDelay: '0.6s' }}></div>
								<div className="driver-header-radar-pulse" style={{ animationDelay: '1.2s' }}></div>
								
								<div className="driver-header-icon-wrapper driver-header-icon-glow">
									<Zap className="driver-header-zap-icon" />
								</div>
								
								<span className="driver-header-status-text">En línea</span>
								<div className="driver-header-status-dot"></div>
							</div>
						) : (
							<div className="driver-header-status-disconnected">
								<div className="driver-header-icon-wrapper-offline">
									<Zap className="driver-header-zap-icon" />
								</div>
								<span className="driver-header-status-text">Desconectado</span>
							</div>
						)}
					</motion.button>

					{/* Botón de soporte */}
					{onSupportClick && (
						<motion.button
							onClick={onSupportClick}
							className="driver-header-logout-button"
							whileTap={{ scale: 0.95 }}
							title="Soporte"
							style={{ background: '#10b981', borderColor: '#10b981' }}
						>
							<MessageCircle className="driver-header-logout-icon" style={{ color: 'white' }} />
						</motion.button>
					)}

					{/* Botón de notificaciones */}
					<motion.button
						className="driver-header-logout-button driver-notification-button"
						whileTap={{ scale: 0.95 }}
						title="Notificaciones"
						style={{ background: '#f59e0b', borderColor: '#f59e0b', position: 'relative' }}
						onClick={() => {
							// TODO: Implementar notificaciones
							console.log('Notificaciones');
						}}
					>
						<Bell className="driver-header-logout-icon" style={{ color: 'white' }} />
						{unreadSupportCount > 0 && (
							<span className="driver-notification-badge">{unreadSupportCount > 99 ? '99+' : unreadSupportCount}</span>
						)}
					</motion.button>

					{/* Botón de cerrar sesión */}
					{onLogout && (
						<motion.button
							onClick={onLogout}
							className="driver-header-logout-button"
							whileTap={{ scale: 0.95 }}
							title="Cerrar sesión"
						>
							<LogOut className="driver-header-logout-icon" />
						</motion.button>
					)}
				</div>
			</div>
		</header>
	);
}

