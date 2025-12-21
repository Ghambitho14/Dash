import { useState, useEffect, useMemo } from 'react';
import { useSupport } from '../../hooks/useSupport';
import { getDriversWithActiveOrders } from '../../services/supportService';
import { MessageCircle, X, Send, Store, Shield, Loader2, Bike } from 'lucide-react';
import { formatRelativeTime, getInitials } from '../../utils/utils';
import { useCurrentTime } from '../../utils/utils';
import '../../styles/Components/SupportChat.css';

export function SupportChat({ currentUser, orders, onClose }) {
	const [messageInput, setMessageInput] = useState('');
	const [showDriverList, setShowDriverList] = useState(false);
	const [drivers, setDrivers] = useState([]);
	const [loadingDrivers, setLoadingDrivers] = useState(false);
	const currentTime = useCurrentTime();

	const {
		conversation,
		messages,
		loading,
		sending,
		supportType,
		messagesEndRef,
		startLocalSupport,
		startAdminSupport,
		startDriverSupport,
		sendMessage,
		closeConversation,
	} = useSupport(currentUser);

	// Obtener repartidores con pedidos activos desde orders
	const driversWithOrders = useMemo(() => {
		if (!orders || orders.length === 0) return [];

		const driversMap = new Map();
		orders.forEach(order => {
			if (order.driverId && order.driverName && order.status !== 'Pendiente' && order.status !== 'Entregado') {
				if (!driversMap.has(order.driverId)) {
					driversMap.set(order.driverId, {
						id: order.driverId,
						name: order.driverName,
						activeOrdersCount: 0,
					});
				}
				driversMap.get(order.driverId).activeOrdersCount++;
			}
		});

		return Array.from(driversMap.values());
	}, [orders]);

	// Cargar repartidores desde la base de datos si no hay en orders
	useEffect(() => {
		if (showDriverList && driversWithOrders.length === 0 && currentUser) {
			setLoadingDrivers(true);
			getDriversWithActiveOrders(currentUser.companyId || currentUser.company_id)
				.then(setDrivers)
				.catch(err => {
					console.error('Error cargando repartidores:', err);
					setDrivers([]);
				})
				.finally(() => setLoadingDrivers(false));
		} else if (showDriverList) {
			setDrivers(driversWithOrders);
		}
	}, [showDriverList, driversWithOrders, currentUser]);

	const handleStartLocal = async () => {
		try {
			await startLocalSupport();
		} catch (err) {
			alert('Error al iniciar soporte con cajera: ' + err.message);
		}
	};

	const handleStartAdmin = async () => {
		try {
			await startAdminSupport();
		} catch (err) {
			alert('Error al iniciar soporte con admin: ' + err.message);
		}
	};

	const handleShowDriverList = () => {
		setShowDriverList(true);
	};

	const handleStartDriver = async (driverId) => {
		try {
			await startDriverSupport(driverId);
			setShowDriverList(false);
		} catch (err) {
			alert('Error al iniciar soporte con repartidor: ' + err.message);
		}
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!messageInput.trim() || sending) return;

		try {
			await sendMessage(messageInput);
			setMessageInput('');
		} catch (err) {
			alert('Error al enviar mensaje: ' + err.message);
		}
	};

	const handleClose = async () => {
		if (conversation) {
			await closeConversation();
		}
		onClose();
	};

	// Pantalla de lista de repartidores
	if (showDriverList && !conversation && !loading) {
		return (
			<div className="support-chat-container">
				<div className="support-chat-header">
					<button 
						className="support-chat-close" 
						onClick={() => setShowDriverList(false)}
						style={{ marginRight: 'auto' }}
					>
						←
					</button>
					<h2 className="support-chat-title">Selecciona un Repartidor</h2>
					<button className="support-chat-close" onClick={handleClose}>
						<X />
					</button>
				</div>

				<div className="support-chat-selection">
					{loadingDrivers ? (
						<div className="support-chat-loading">
							<Loader2 className="support-chat-spinner" />
							<span>Cargando repartidores...</span>
						</div>
					) : drivers.length === 0 ? (
						<div className="support-chat-empty">
							<Bike size={48} />
							<p>No hay repartidores con pedidos activos</p>
						</div>
					) : (
						<div className="support-chat-options">
							{drivers.map((driver) => (
								<button
									key={driver.id}
									className="support-chat-option"
									onClick={() => handleStartDriver(driver.id)}
									disabled={loading}
								>
									<div className="support-chat-option-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
										<Bike />
									</div>
									<div className="support-chat-option-content">
										<h3 className="support-chat-option-title">{driver.name}</h3>
										<p className="support-chat-option-description">
											{driver.activeOrdersCount} pedido{driver.activeOrdersCount !== 1 ? 's' : ''} activo{driver.activeOrdersCount !== 1 ? 's' : ''}
										</p>
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}

	// Pantalla de selección de tipo de soporte
	if (!conversation && !loading && !showDriverList) {
		return (
			<div className="support-chat-container">
				<div className="support-chat-header">
					<h2 className="support-chat-title">Soporte</h2>
					<button className="support-chat-close" onClick={handleClose}>
						<X />
					</button>
				</div>

				<div className="support-chat-selection">
					<div className="support-chat-selection-title">
						<MessageCircle size={24} />
						<span>Selecciona el tipo de soporte</span>
					</div>

					<div className="support-chat-options">
						{currentUser?.localId && (
							<button
								className="support-chat-option"
								onClick={handleStartLocal}
								disabled={loading}
							>
								<div className="support-chat-option-icon">
									<Store />
								</div>
								<div className="support-chat-option-content">
									<h3 className="support-chat-option-title">Soporte Local</h3>
									<p className="support-chat-option-description">
										Habla con la cajera de tu local
									</p>
								</div>
							</button>
						)}

						<button
							className="support-chat-option"
							onClick={handleStartAdmin}
							disabled={loading}
						>
							<div className="support-chat-option-icon support-chat-option-icon-admin">
								<Shield />
							</div>
							<div className="support-chat-option-content">
								<h3 className="support-chat-option-title">Soporte Admin</h3>
								<p className="support-chat-option-description">
									Habla con el panel de administración
								</p>
							</div>
						</button>

						<button
							className="support-chat-option"
							onClick={handleShowDriverList}
							disabled={loading}
						>
							<div className="support-chat-option-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
								<Bike />
							</div>
							<div className="support-chat-option-content">
								<h3 className="support-chat-option-title">Repartidor</h3>
								<p className="support-chat-option-description">
									Habla con un repartidor con pedidos activos
								</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Pantalla de chat
	return (
		<div className="support-chat-container">
			<div className="support-chat-header">
				<div className="support-chat-header-info">
					{supportType === 'local' ? <Store size={20} /> : supportType === 'driver' ? <Bike size={20} /> : <Shield size={20} />}
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<h2 className="support-chat-title">
								{supportType === 'local' ? 'Soporte Local' : supportType === 'driver' ? 'Soporte Repartidor' : 'Soporte Admin'}
							</h2>
							<span className="support-chat-realtime-indicator" title="Tiempo real activo">
								<span className="support-chat-realtime-dot"></span>
								En tiempo real
							</span>
						</div>
						<span className="support-chat-subtitle">
							{supportType === 'local' ? 'Conversando con la cajera' : supportType === 'driver' ? 'Conversando con repartidor' : 'Conversando con administración'}
						</span>
					</div>
				</div>
				<button className="support-chat-close" onClick={handleClose}>
					<X />
				</button>
			</div>

			<div className="support-chat-messages">
				{loading && messages.length === 0 ? (
					<div className="support-chat-loading">
						<Loader2 className="support-chat-spinner" />
						<span>Cargando conversación...</span>
					</div>
				) : messages.length === 0 ? (
					<div className="support-chat-empty">
						<MessageCircle size={48} />
						<p>No hay mensajes aún. ¡Envía el primero!</p>
					</div>
				) : (
					messages.map((message) => {
						// Un mensaje es propio solo si es de tipo 'company_user' y el sender_id coincide
						const isOwn = message.sender_type === 'company_user' && 
							message.sender_id === (currentUser?._dbId || currentUser?.id);
						const isRead = message.read_at !== null;

						return (
							<div
								key={message.id}
								className={`support-chat-message ${isOwn ? 'support-chat-message-own' : ''} ${message._isTemporary ? 'support-chat-message-temporary' : ''}`}
							>
								{!isOwn && (
									<div className="support-chat-message-avatar">
										{getInitials(
											supportType === 'local' ? 'Cajera' : supportType === 'driver' ? 'Repartidor' : 'Admin'
										)}
									</div>
								)}
								<div className="support-chat-message-content">
									<div className="support-chat-message-bubble">
										<p className="support-chat-message-text">{message.message}</p>
									</div>
									<div className="support-chat-message-meta">
										<span className="support-chat-message-time">
											{formatRelativeTime(message.created_at, currentTime)}
										</span>
										{isOwn && (
											<span className={`support-chat-message-status ${isRead ? 'read' : ''}`}>
												{isRead ? '✓✓' : '✓'}
											</span>
										)}
									</div>
								</div>
								{isOwn && (
									<div className="support-chat-message-avatar support-chat-message-avatar-own">
										{getInitials(currentUser?.name || 'Yo')}
									</div>
								)}
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			<form className="support-chat-input-form" onSubmit={handleSendMessage}>
				<input
					type="text"
					className="support-chat-input"
					placeholder="Escribe un mensaje..."
					value={messageInput}
					onChange={(e) => setMessageInput(e.target.value)}
					disabled={sending || loading}
				/>
				<button
					type="submit"
					className="support-chat-send"
					disabled={!messageInput.trim() || sending || loading}
				>
					{sending ? <Loader2 className="support-chat-spinner-small" /> : <Send size={20} />}
				</button>
			</form>
		</div>
	);
}

