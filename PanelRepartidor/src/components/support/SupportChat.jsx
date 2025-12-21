import { useState, useEffect } from 'react';
import { useSupport } from '../../hooks/useSupport';
import { MessageCircle, X, Send, Shield, Store, Loader2 } from 'lucide-react';
import { formatRelativeTime, getInitials } from '../../utils/utils';
import { useCurrentTime } from '../../utils/utils';
import '../../styles/Components/SupportChat.css';

export function SupportChat({ currentDriver, onClose, localId, companyId, localName }) {
	const [messageInput, setMessageInput] = useState('');
	const currentTime = useCurrentTime();

	const {
		conversation,
		messages,
		loading,
		sending,
		supportType,
		messagesEndRef,
		startAdminSupport,
		startLocalSupport,
		sendMessage,
		closeConversation,
	} = useSupport(currentDriver);

	// Si se pasa localId, iniciar automáticamente soporte con el local
	useEffect(() => {
		if (localId && companyId && !conversation && !loading) {
			startLocalSupport(localId, companyId).catch(err => {
				console.error('Error iniciando soporte local:', err);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localId, companyId]);

	const handleStartAdminSupport = async () => {
		try {
			await startAdminSupport();
		} catch (err) {
			alert('Error al iniciar soporte admin: ' + err.message);
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

	// Pantalla de inicio (solo si no hay localId)
	if (!conversation && !loading && !localId) {
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
						<button
							className="support-chat-option"
							onClick={handleStartAdminSupport}
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
					{supportType === 'local' ? <Store size={20} /> : <Shield size={20} />}
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<h2 className="support-chat-title">
								{supportType === 'local' ? 'Soporte Local' : 'Soporte Admin'}
							</h2>
							<span className="support-chat-realtime-indicator" title="Tiempo real activo">
								<span className="support-chat-realtime-dot"></span>
								En tiempo real
							</span>
						</div>
						<span className="support-chat-subtitle">
							{supportType === 'local' 
								? `Conversando con ${localName || 'el local'}` 
								: 'Conversando con administración'}
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
						// Un mensaje es propio solo si es de tipo 'driver' y el sender_id coincide
						const isOwn = message.sender_type === 'driver' && 
							message.sender_id === currentDriver?.id;
						const isRead = message.read_at !== null;

						return (
							<div
								key={message.id}
								className={`support-chat-message ${isOwn ? 'support-chat-message-own' : ''} ${message._isTemporary ? 'support-chat-message-temporary' : ''}`}
							>
								{!isOwn && (
									<div className="support-chat-message-avatar">
										{getInitials(supportType === 'local' ? (localName || 'Local') : 'Admin')}
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
										{getInitials(currentDriver?.name || 'Yo')}
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

