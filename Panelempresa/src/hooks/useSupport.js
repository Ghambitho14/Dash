import { useState, useEffect, useCallback, useRef } from 'react';
import {
	getOrCreateLocalSupportConversation,
	getOrCreateAdminSupportConversation,
	getOrCreateDriverSupportConversation,
	getConversationMessages,
	sendMessage as sendMessageService,
	markMessagesAsRead,
	closeConversation as closeConversationService,
} from '../services/supportService';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { useNotifications } from './useNotifications';

/**
 * Hook para gestionar soporte/chat
 */
export function useSupport(currentUser) {
	const [conversation, setConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [supportType, setSupportType] = useState(null); // 'local', 'admin' o 'driver'
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
			
			// Marcar mensajes como leídos
			if (currentUser) {
				await markMessagesAsRead(conversationId, currentUser._dbId || currentUser.id);
			}
		} catch (err) {
			logger.error('Error cargando mensajes:', err);
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	// Iniciar conversación con cajera del local
	const startLocalSupport = useCallback(async () => {
		if (!currentUser || !currentUser.localId) {
			throw new Error('No tienes un local asignado');
		}

		setLoading(true);
		try {
			const conv = await getOrCreateLocalSupportConversation(
				currentUser._dbId || currentUser.id,
				currentUser.localId,
				currentUser.companyId || currentUser.company_id
			);
			setSupportType('local');
			setConversation(conv);
			await loadMessages(conv.id);
		} catch (err) {
			logger.error('Error iniciando soporte local:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [currentUser, loadMessages]);

	// Iniciar conversación con admin
	const startAdminSupport = useCallback(async () => {
		if (!currentUser) {
			throw new Error('Usuario no autenticado');
		}

		setLoading(true);
		try {
			const conv = await getOrCreateAdminSupportConversation(
				currentUser._dbId || currentUser.id,
				currentUser.companyId || currentUser.company_id
			);
			setSupportType('admin');
			setConversation(conv);
			await loadMessages(conv.id);
		} catch (err) {
			logger.error('Error iniciando soporte admin:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [currentUser, loadMessages]);

	// Iniciar conversación con repartidor
	const startDriverSupport = useCallback(async (driverId) => {
		if (!currentUser) {
			throw new Error('Usuario no autenticado');
		}

		if (!driverId) {
			throw new Error('ID de repartidor requerido');
		}

		setLoading(true);
		try {
			const conv = await getOrCreateDriverSupportConversation(
				currentUser._dbId || currentUser.id,
				driverId,
				currentUser.companyId || currentUser.company_id
			);
			setSupportType('driver');
			setConversation(conv);
			await loadMessages(conv.id);
		} catch (err) {
			logger.error('Error iniciando soporte con repartidor:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [currentUser, loadMessages]);

	// Enviar mensaje
	const sendMessage = useCallback(async (messageText) => {
		if (!conversation || !messageText.trim() || !currentUser) return;

		const messageTextTrimmed = messageText.trim();
		const senderId = currentUser._dbId || currentUser.id;
		const senderType = 'company_user';

		// Optimistic update: agregar mensaje temporal inmediatamente
		const tempMessage = {
			id: `temp-${Date.now()}`,
			conversation_id: conversation.id,
			sender_id: senderId,
			sender_type: senderType,
			message: messageTextTrimmed,
			created_at: new Date().toISOString(),
			read_at: null,
			_isTemporary: true,
		};

		setMessages(prev => [...prev, tempMessage]);
		scrollToBottom();
		setSending(true);

		try {
			const newMessage = await sendMessageService(
				conversation.id,
				senderId,
				senderType,
				messageTextTrimmed
			);
			
			// Reemplazar mensaje temporal con el real
			setMessages(prev => {
				const filtered = prev.filter(m => m.id !== tempMessage.id);
				// Evitar duplicados
				if (!filtered.some(m => m.id === newMessage.id)) {
					return [...filtered, newMessage];
				}
				return filtered;
			});
			
			setTimeout(() => scrollToBottom(), 100);
		} catch (err) {
			// Revertir optimistic update en caso de error
			setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
			logger.error('Error enviando mensaje:', err);
			throw err;
		} finally {
			setSending(false);
		}
	}, [conversation, currentUser, scrollToBottom]);

	// Cerrar conversación
	const closeConversation = useCallback(async () => {
		if (!conversation) return;

		try {
			await closeConversationService(conversation.id);
			setConversation(null);
			setMessages([]);
			setSupportType(null);
		} catch (err) {
			logger.error('Error cerrando conversación:', err);
		}
	}, [conversation]);

	// Suscribirse a nuevos mensajes en tiempo real
	useEffect(() => {
		if (!conversation || !currentUser) {
			// Limpiar suscripción si no hay conversación
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
			return;
		}

		const conversationId = conversation.id;
		const userId = currentUser._dbId || currentUser.id;

		// Crear canal de Realtime
		const channel = supabase
			.channel(`support-${conversationId}`)
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
					logger.log('📨 Nuevo mensaje recibido en tiempo real:', newMessage);
					
					setMessages(prev => {
						// Evitar duplicados
						if (prev.some(m => m.id === newMessage.id)) {
							return prev;
						}
						return [...prev, newMessage];
					});
					
					// Scroll automático
					setTimeout(() => scrollToBottom(), 100);
					
					// Marcar como leído si no es nuestro mensaje
					if (newMessage.sender_id !== userId && newMessage.sender_type !== 'company_user') {
						markMessagesAsRead(conversationId, userId).catch(err => {
							logger.error('Error marcando mensaje como leído:', err);
						});

						// Mostrar notificación si no es nuestro mensaje
						const isTabActive = !document.hidden;
						const isChatVisible = document.querySelector('.support-chat') !== null;
						
						// Mostrar notificación si:
						// 1. La pestaña no está activa (siempre mostrar)
						// 2. O si la pestaña está activa pero el chat no está visible
						const supportModal = document.querySelector('.support-chat-container');
						const isSupportModalOpen = supportModal && window.getComputedStyle(supportModal).display !== 'none';
						
						// Siempre mostrar si la pestaña no está activa, o si está activa pero el chat no está abierto
						if (!isTabActive || (isTabActive && !isSupportModalOpen)) {
							let senderName = 'Soporte';
							if (newMessage.sender_type === 'superadmin') {
								senderName = 'Administrador';
							} else if (newMessage.sender_type === 'local_cashier') {
								senderName = 'Cajera';
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
					logger.log('✅ Suscrito correctamente a mensajes de soporte en tiempo real');
				} else if (status === 'CHANNEL_ERROR') {
					logger.error('❌ Error en canal de suscripción de soporte');
				} else if (status === 'TIMED_OUT') {
					logger.warn('⏱️ Timeout en suscripción de soporte');
				} else if (status === 'CLOSED') {
					logger.warn('🔒 Canal de soporte cerrado');
				}
			});

		channelRef.current = channel;

		// Fallback: recargar mensajes cada 5 segundos por si Realtime falla
		const fallbackInterval = setInterval(() => {
			if (conversationId) {
				loadMessages(conversationId).catch(err => {
					logger.error('Error en fallback de mensajes:', err);
				});
			}
		}, 5000);

		return () => {
			clearInterval(fallbackInterval);
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
		};
	}, [conversation, currentUser, scrollToBottom, loadMessages]);

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
		startLocalSupport,
		startAdminSupport,
		startDriverSupport,
		sendMessage,
		closeConversation,
		loadMessages,
	};
}

