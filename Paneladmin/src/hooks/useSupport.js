import { useState, useEffect, useCallback, useRef } from 'react';
import {
	getAdminSupportConversations,
	getConversationMessages,
	sendAdminMessage,
	markMessagesAsRead,
	closeConversation as closeConversationService,
} from '../services/supportService';
import { supabase } from '../utils/supabase';
import { useNotifications } from './useNotifications';

/**
 * Hook para gestionar soporte/chat en PanelAdmin
 */
export function useSupport(admin) {
	const [conversations, setConversations] = useState([]);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef(null);
	const channelRef = useRef(null);
	const { showNotification } = useNotifications();

	// Scroll al final de los mensajes
	const scrollToBottom = useCallback(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	// Cargar conversaciones
	const loadConversations = useCallback(async () => {
		if (!admin) return;

		setLoading(true);
		try {
			const convs = await getAdminSupportConversations();
			setConversations(convs);
		} catch (err) {
			console.error('Error cargando conversaciones:', err);
		} finally {
			setLoading(false);
		}
	}, [admin]);

	// Cargar mensajes de una conversación
	const loadMessages = useCallback(async (conversationId) => {
		if (!conversationId) return;

		setLoading(true);
		try {
			const loadedMessages = await getConversationMessages(conversationId);
			setMessages(loadedMessages);
			
			// Marcar mensajes como leídos
			if (admin) {
				await markMessagesAsRead(conversationId, admin.id);
			}
		} catch (err) {
			console.error('Error cargando mensajes:', err);
		} finally {
			setLoading(false);
		}
	}, [admin]);

	// Seleccionar conversación
	const selectConversation = useCallback(async (conversation) => {
		setSelectedConversation(conversation);
		await loadMessages(conversation.id);
	}, [loadMessages]);

	// Enviar mensaje
	const sendMessage = useCallback(async (messageText) => {
		if (!selectedConversation || !messageText.trim() || !admin) return;

		const messageTextTrimmed = messageText.trim();

		// Optimistic update
		const tempMessage = {
			id: `temp-${Date.now()}`,
			conversation_id: selectedConversation.id,
			sender_id: admin.id,
			sender_type: 'superadmin',
			message: messageTextTrimmed,
			created_at: new Date().toISOString(),
			read_at: null,
			_isTemporary: true,
		};

		setMessages(prev => [...prev, tempMessage]);
		scrollToBottom();
		setSending(true);

		try {
			const newMessage = await sendAdminMessage(
				selectedConversation.id,
				admin.id,
				messageTextTrimmed
			);
			
			setMessages(prev => {
				const filtered = prev.filter(m => m.id !== tempMessage.id);
				if (!filtered.some(m => m.id === newMessage.id)) {
					return [...filtered, newMessage];
				}
				return filtered;
			});
			
			setTimeout(() => scrollToBottom(), 100);
		} catch (err) {
			setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
			throw err;
		} finally {
			setSending(false);
		}
	}, [selectedConversation, admin, scrollToBottom]);

	// Cerrar conversación
	const closeConversation = useCallback(async () => {
		if (!selectedConversation) return;

		try {
			await closeConversationService(selectedConversation.id);
			await loadConversations();
			setSelectedConversation(null);
			setMessages([]);
		} catch (err) {
			console.error('Error cerrando conversación:', err);
		}
	}, [selectedConversation, loadConversations]);

	// Suscribirse a nuevos mensajes en tiempo real
	useEffect(() => {
		if (!selectedConversation || !admin) {
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
			return;
		}

		const conversationId = selectedConversation.id;
		const adminId = admin.id;

		const channel = supabase
			.channel(`admin-support-${conversationId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'support_messages',
					filter: `conversation_id=eq.${conversationId}`,
				},
				(payload) => {
					const newMessage = payload.new;
					setMessages(prev => {
						if (prev.some(m => m.id === newMessage.id)) {
							return prev;
						}
						return [...prev, newMessage];
					});
					setTimeout(() => scrollToBottom(), 100);
					
					if (newMessage.sender_id !== adminId && newMessage.sender_type !== 'superadmin') {
						markMessagesAsRead(conversationId, adminId).catch(console.error);

						// Mostrar notificación si no es nuestro mensaje
						const isTabActive = !document.hidden;
						const supportModal = document.querySelector('.admin-support-container');
						const isSupportModalOpen = supportModal && window.getComputedStyle(supportModal).display !== 'none';
						
						// Siempre mostrar si la pestaña no está activa, o si está activa pero el chat no está abierto
						if (!isTabActive || (isTabActive && !isSupportModalOpen)) {
							let senderName = 'Usuario';
							if (newMessage.sender_type === 'company_user') {
								senderName = 'Usuario Empresarial';
							} else if (newMessage.sender_type === 'driver') {
								senderName = 'Repartidor';
							}

							const messagePreview = newMessage.message.length > 50 
								? newMessage.message.substring(0, 50) + '...' 
								: newMessage.message;

							showNotification(`${senderName}: ${messagePreview}`, {
								body: newMessage.message,
								tag: `support-${conversationId}`,
							});
						}
					}
				}
			)
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					console.log('✅ Suscrito a mensajes admin');
				}
			});

		channelRef.current = channel;

		const fallbackInterval = setInterval(() => {
			if (conversationId) {
				loadMessages(conversationId).catch(console.error);
			}
		}, 5000);

		return () => {
			clearInterval(fallbackInterval);
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
		};
	}, [selectedConversation, admin, scrollToBottom, loadMessages]);

	// Suscribirse a nuevas conversaciones
	useEffect(() => {
		if (!admin) return;

		const channel = supabase
			.channel('admin-support-conversations')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'support_conversations',
					filter: `conversation_type=eq.admin_support`,
				},
				() => {
					loadConversations();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [admin, loadConversations]);

	// Scroll cuando cambian los mensajes
	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	return {
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
	};
}

