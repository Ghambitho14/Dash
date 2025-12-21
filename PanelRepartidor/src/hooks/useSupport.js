import { useState, useEffect, useCallback, useRef } from 'react';
import {
	getOrCreateDriverSupportConversation,
	getOrCreateLocalSupportConversation,
	getConversationMessages,
	sendDriverMessage,
	markMessagesAsRead,
	closeConversation as closeConversationService,
} from '../services/supportService';
import { supabase } from '../utils/supabase';
import { useNotifications } from './useNotifications';

/**
 * Hook para gestionar soporte/chat en App Repartidor
 */
export function useSupport(currentDriver) {
	const [conversation, setConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [supportType, setSupportType] = useState(null); // 'admin' o 'local'
	const messagesEndRef = useRef(null);
	const channelRef = useRef(null);
	const { showNotification } = useNotifications();

	// Scroll al final de los mensajes
	const scrollToBottom = useCallback(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	// Cargar mensajes de una conversación
	const loadMessages = useCallback(async (conversationId) => {
		if (!conversationId) return;

		setLoading(true);
		try {
			const loadedMessages = await getConversationMessages(conversationId);
			setMessages(loadedMessages);
			
			if (currentDriver) {
				await markMessagesAsRead(conversationId, currentDriver.id);
			}
		} catch (err) {
			console.error('Error cargando mensajes:', err);
		} finally {
			setLoading(false);
		}
	}, [currentDriver]);

	// Iniciar conversación con admin
	const startAdminSupport = useCallback(async () => {
		if (!currentDriver) {
			throw new Error('Repartidor no autenticado');
		}

		setLoading(true);
		try {
			const conv = await getOrCreateDriverSupportConversation(
				currentDriver.id,
				currentDriver.companyId || currentDriver.company_id
			);
			setSupportType('admin');
			setConversation(conv);
			await loadMessages(conv.id);
		} catch (err) {
			console.error('Error iniciando soporte admin:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [currentDriver, loadMessages]);

	// Iniciar conversación con local
	const startLocalSupport = useCallback(async (localId, companyId) => {
		if (!currentDriver) {
			throw new Error('Repartidor no autenticado');
		}

		if (!localId) {
			throw new Error('Local ID requerido');
		}

		setLoading(true);
		try {
			const conv = await getOrCreateLocalSupportConversation(
				currentDriver.id,
				localId,
				companyId || currentDriver.companyId || currentDriver.company_id
			);
			setSupportType('local');
			setConversation(conv);
			await loadMessages(conv.id);
		} catch (err) {
			console.error('Error iniciando soporte local:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [currentDriver, loadMessages]);

	// Enviar mensaje
	const sendMessage = useCallback(async (messageText) => {
		if (!conversation || !messageText.trim() || !currentDriver) return;

		const messageTextTrimmed = messageText.trim();
		const driverId = currentDriver.id;

		const tempMessage = {
			id: `temp-${Date.now()}`,
			conversation_id: conversation.id,
			sender_id: driverId,
			sender_type: 'driver',
			message: messageTextTrimmed,
			created_at: new Date().toISOString(),
			read_at: null,
			_isTemporary: true,
		};

		setMessages(prev => [...prev, tempMessage]);
		scrollToBottom();
		setSending(true);

		try {
			const newMessage = await sendDriverMessage(
				conversation.id,
				driverId,
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
	}, [conversation, currentDriver, scrollToBottom]);

	// Cerrar conversación
	const closeConversation = useCallback(async () => {
		if (!conversation) return;

		try {
			await closeConversationService(conversation.id);
			setConversation(null);
			setMessages([]);
		} catch (err) {
			console.error('Error cerrando conversación:', err);
		}
	}, [conversation]);

	// Suscribirse a nuevos mensajes en tiempo real
	useEffect(() => {
		if (!conversation || !currentDriver) {
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
			return;
		}

		const conversationId = conversation.id;
		const driverId = currentDriver.id;

		const channel = supabase
			.channel(`driver-support-${conversationId}`)
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
					
					if (newMessage.sender_id !== driverId && newMessage.sender_type !== 'driver') {
						markMessagesAsRead(conversationId, driverId).catch(console.error);

						// Mostrar notificación si no es nuestro mensaje
						const isTabActive = !document.hidden;
						const supportModal = document.querySelector('.support-chat-container');
						const isSupportModalOpen = supportModal && window.getComputedStyle(supportModal).display !== 'none';
						
						// Siempre mostrar si la pestaña no está activa, o si está activa pero el chat no está abierto
						if (!isTabActive || (isTabActive && !isSupportModalOpen)) {
							let senderName = 'Soporte';
							if (newMessage.sender_type === 'superadmin') {
								senderName = 'Administrador';
							} else if (newMessage.sender_type === 'local_cashier' || newMessage.sender_type === 'company_user') {
								senderName = 'Local';
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
			.subscribe();

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
	}, [conversation, currentDriver, scrollToBottom, loadMessages]);

	// Scroll cuando cambian los mensajes
	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	return {
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
	};
}

