import { useState, useEffect } from 'react';
import { useSupport } from '../hooks/useSupport';
import { MessageCircle, X, Send, Shield, Loader2, Users, Building2 } from 'lucide-react';
import '../style/SupportChat.css';

export function SupportChat({ admin, onClose }) {
	const [messageInput, setMessageInput] = useState('');
	const [view, setView] = useState('list'); // 'list' o 'chat'

	const {
		conversations,
		selectedConversation,
		messages,
		loading,
		sending,
		messagesEndRef,
		loadConversations,
		selectConversation,
		sendMessage,
		closeConversation,
	} = useSupport(admin);

	useEffect(() => {
		loadConversations();
	}, [loadConversations]);

	const handleSelectConversation = async (conv) => {
		await selectConversation(conv);
		setView('chat');
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
		if (selectedConversation) {
			await closeConversation();
		}
		setView('list');
		onClose();
	};

	const handleBackToList = () => {
		setView('list');
	};

	// Vista de lista de conversaciones
	if (view === 'list') {
		return (
			<div className="admin-support-container">
				<div className="admin-support-header">
					<div className="admin-support-header-info">
						<Shield size={20} />
						<h2 className="admin-support-title">Soporte Admin</h2>
					</div>
					<button className="admin-support-close" onClick={handleClose}>
						<X />
					</button>
				</div>

				<div className="admin-support-list">
					{loading && conversations.length === 0 ? (
						<div className="admin-support-loading">
							<Loader2 className="admin-support-spinner" />
							<span>Cargando conversaciones...</span>
						</div>
					) : conversations.length === 0 ? (
						<div className="admin-support-empty">
							<MessageCircle size={48} />
							<p>No hay conversaciones abiertas</p>
						</div>
					) : (
						conversations.map((conv) => {
							const unreadCount = messages.filter(m => 
								m.conversation_id === conv.id && 
								m.sender_type !== 'superadmin' && 
								!m.read_at
							).length;

							return (
								<button
									key={conv.id}
									className="admin-support-conversation-item"
									onClick={() => handleSelectConversation(conv)}
								>
									<div className="admin-support-conversation-avatar">
										<Users />
									</div>
									<div className="admin-support-conversation-content">
										<div className="admin-support-conversation-header">
											<h3 className="admin-support-conversation-name">
												{conv.company_users?.name || 'Usuario'}
											</h3>
											{unreadCount > 0 && (
												<span className="admin-support-conversation-badge">
													{unreadCount}
												</span>
											)}
										</div>
										<p className="admin-support-conversation-company">
											{conv.companies?.name || 'Empresa'}
										</p>
										<p className="admin-support-conversation-time">
											{new Date(conv.updated_at).toLocaleString('es-ES')}
										</p>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>
		);
	}

	// Vista de chat
	return (
		<div className="admin-support-container">
			<div className="admin-support-header">
				<div className="admin-support-header-info">
					<button className="admin-support-back" onClick={handleBackToList}>
						←
					</button>
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<h2 className="admin-support-title">
								{selectedConversation?.company_users?.name || 'Usuario'}
							</h2>
							<span className="admin-support-realtime-indicator" title="Tiempo real activo">
								<span className="admin-support-realtime-dot"></span>
								En tiempo real
							</span>
						</div>
						<span className="admin-support-subtitle">
							{selectedConversation?.companies?.name || 'Empresa'}
						</span>
					</div>
				</div>
				<button className="admin-support-close" onClick={handleClose}>
					<X />
				</button>
			</div>

			<div className="admin-support-messages">
				{loading && messages.length === 0 ? (
					<div className="admin-support-loading">
						<Loader2 className="admin-support-spinner" />
						<span>Cargando conversación...</span>
					</div>
				) : messages.length === 0 ? (
					<div className="admin-support-empty">
						<MessageCircle size={48} />
						<p>No hay mensajes aún</p>
					</div>
				) : (
					messages.map((message) => {
						const isOwn = message.sender_type === 'superadmin';
						const isRead = message.read_at !== null;

						return (
							<div
								key={message.id}
								className={`admin-support-message ${isOwn ? 'admin-support-message-own' : ''} ${message._isTemporary ? 'admin-support-message-temporary' : ''}`}
							>
								{!isOwn && (
									<div className="admin-support-message-avatar">
										<Users size={16} />
									</div>
								)}
								<div className="admin-support-message-content">
									<div className="admin-support-message-bubble">
										<p className="admin-support-message-text">{message.message}</p>
									</div>
									<div className="admin-support-message-meta">
										<span className="admin-support-message-time">
											{new Date(message.created_at).toLocaleTimeString('es-ES', {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</span>
										{isOwn && (
											<span className={`admin-support-message-status ${isRead ? 'read' : ''}`}>
												{isRead ? '✓✓' : '✓'}
											</span>
										)}
									</div>
								</div>
								{isOwn && (
									<div className="admin-support-message-avatar admin-support-message-avatar-own">
										<Shield size={16} />
									</div>
								)}
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			<form className="admin-support-input-form" onSubmit={handleSendMessage}>
				<input
					type="text"
					className="admin-support-input"
					placeholder="Escribe un mensaje..."
					value={messageInput}
					onChange={(e) => setMessageInput(e.target.value)}
					disabled={sending || loading}
				/>
				<button
					type="submit"
					className="admin-support-send"
					disabled={!messageInput.trim() || sending || loading}
				>
					{sending ? <Loader2 className="admin-support-spinner-small" /> : <Send size={20} />}
				</button>
			</form>
		</div>
	);
}

