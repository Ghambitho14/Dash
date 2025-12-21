import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Hook para rastrear mensajes no leídos de soporte
 */
export function useUnreadSupportMessages(currentUser) {
	const [unreadCount, setUnreadCount] = useState(0);
	const channelRef = useRef(null);

	// Cargar mensajes no leídos iniciales
	useEffect(() => {
		if (!currentUser) {
			setUnreadCount(0);
			return;
		}

		const loadUnreadCount = async () => {
			try {
				const userId = currentUser._dbId || currentUser.id;
				const companyId = currentUser.companyId || currentUser.company_id;

				// Obtener todas las conversaciones del usuario
				const { data: conversations, error: convError } = await supabase
					.from('support_conversations')
					.select('id')
					.or(`user_id.eq.${userId},company_id.eq.${companyId}`)
					.eq('status', 'open');

				if (convError) throw convError;

				if (!conversations || conversations.length === 0) {
					setUnreadCount(0);
					return;
				}

				const conversationIds = conversations.map(c => c.id);

				// Contar mensajes no leídos
				const { data: unreadMessages, error: msgError } = await supabase
					.from('support_messages')
					.select('id')
					.in('conversation_id', conversationIds)
					.neq('sender_id', userId)
					.neq('sender_type', 'company_user')
					.is('read_at', null);

				if (msgError) throw msgError;

				setUnreadCount(unreadMessages?.length || 0);
			} catch (err) {
				logger.error('Error cargando mensajes no leídos:', err);
			}
		};

		loadUnreadCount();

		// Fallback: recargar contador cada 10 segundos
		const fallbackInterval = setInterval(() => {
			loadUnreadCount();
		}, 10000);

		// Suscribirse a nuevos mensajes en tiempo real
		if (currentUser) {
			const userId = currentUser._dbId || currentUser.id;
			const companyId = currentUser.companyId || currentUser.company_id;

			const channel = supabase
				.channel('unread-support-messages')
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'support_messages',
					},
					async (payload) => {
						const newMessage = payload.new;
						logger.log('📨 Nuevo mensaje recibido en hook de no leídos:', newMessage);

						// Verificar si el mensaje es del usuario actual
						if (newMessage.sender_id === userId || newMessage.sender_type === 'company_user') {
							logger.log('Mensaje ignorado: es del usuario actual');
							return;
						}

						// Verificar si pertenece a una conversación del usuario
						const { data: conversation, error: convError } = await supabase
							.from('support_conversations')
							.select('user_id, company_id')
							.eq('id', newMessage.conversation_id)
							.single();

						if (convError) {
							logger.error('Error obteniendo conversación:', convError);
							return;
						}

						if (!conversation) {
							logger.log('Conversación no encontrada');
							return;
						}

						logger.log('Conversación encontrada:', conversation, 'userId:', userId, 'companyId:', companyId);

						// Verificar si la conversación pertenece al usuario
						const belongsToUser = conversation.user_id === userId || conversation.company_id === companyId;
						
						if (belongsToUser) {
							logger.log('✅ Mensaje pertenece al usuario, incrementando contador');
							// Verificar si el chat está abierto
							const supportModal = document.querySelector('.support-chat-container');
							const isSupportModalOpen = supportModal && window.getComputedStyle(supportModal).display !== 'none';

							// Solo incrementar si el chat no está abierto
							if (!isSupportModalOpen) {
								logger.log('Chat no está abierto, incrementando contador');
								setUnreadCount(prev => {
									const newCount = prev + 1;
									logger.log('Nuevo contador:', newCount);
									return newCount;
								});
							} else {
								logger.log('Chat está abierto, no se incrementa contador');
							}
						} else {
							logger.log('Mensaje no pertenece al usuario');
						}
					}
				)
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'support_messages',
					},
					(payload) => {
						// Si se marca como leído, decrementar contador
						if (payload.new.read_at && !payload.old.read_at) {
							setUnreadCount(prev => Math.max(0, prev - 1));
						}
					}
				)
				.subscribe((status) => {
					if (status === 'SUBSCRIBED') {
						logger.log('✅ Suscrito correctamente a mensajes no leídos');
					} else if (status === 'CHANNEL_ERROR') {
						logger.error('❌ Error en canal de mensajes no leídos');
					} else {
						logger.log('Estado del canal:', status);
					}
				});

			channelRef.current = channel;
		}

		return () => {
			clearInterval(fallbackInterval);
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
		};
	}, [currentUser]);

	// Limpiar contador cuando se abre el chat
	const clearUnreadCount = () => {
		setUnreadCount(0);
	};

	return { unreadCount, clearUnreadCount };
}

