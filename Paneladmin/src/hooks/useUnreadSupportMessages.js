import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Hook para rastrear mensajes no leídos de soporte en PanelAdmin
 */
export function useUnreadSupportMessages(admin) {
	const [unreadCount, setUnreadCount] = useState(0);
	const channelRef = useRef(null);

	// Cargar mensajes no leídos iniciales
	useEffect(() => {
		if (!admin) {
			setUnreadCount(0);
			return;
		}

		const loadUnreadCount = async () => {
			try {
				// Obtener todas las conversaciones de admin
				const { data: conversations, error: convError } = await supabase
					.from('support_conversations')
					.select('id')
					.eq('conversation_type', 'admin_support')
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
					.neq('sender_id', admin.id)
					.neq('sender_type', 'superadmin')
					.is('read_at', null);

				if (msgError) throw msgError;

				setUnreadCount(unreadMessages?.length || 0);
			} catch (err) {
				console.error('Error cargando mensajes no leídos:', err);
			}
		};

		loadUnreadCount();

		// Fallback: recargar contador cada 10 segundos
		const fallbackInterval = setInterval(() => {
			loadUnreadCount();
		}, 10000);

		// Suscribirse a nuevos mensajes en tiempo real
		if (admin) {
			const channel = supabase
				.channel('admin-unread-support-messages')
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'support_messages',
					},
					async (payload) => {
						const newMessage = payload.new;
						console.log('📨 Nuevo mensaje recibido en hook de no leídos (admin):', newMessage);

						// Verificar si el mensaje es del admin
						if (newMessage.sender_id === admin.id || newMessage.sender_type === 'superadmin') {
							console.log('Mensaje ignorado: es del admin');
							return;
						}

						// Verificar si pertenece a una conversación de admin
						const { data: conversation, error: convError } = await supabase
							.from('support_conversations')
							.select('conversation_type')
							.eq('id', newMessage.conversation_id)
							.single();

						if (convError) {
							console.error('Error obteniendo conversación:', convError);
							return;
						}

						if (conversation && conversation.conversation_type === 'admin_support') {
							console.log('✅ Mensaje pertenece a conversación de admin, incrementando contador');
							// Verificar si el chat está abierto
							const supportModal = document.querySelector('.admin-support-container');
							const isSupportModalOpen = supportModal && window.getComputedStyle(supportModal).display !== 'none';

							// Solo incrementar si el chat no está abierto
							if (!isSupportModalOpen) {
								console.log('Chat no está abierto, incrementando contador');
								setUnreadCount(prev => {
									const newCount = prev + 1;
									console.log('Nuevo contador:', newCount);
									return newCount;
								});
							} else {
								console.log('Chat está abierto, no se incrementa contador');
							}
						} else {
							console.log('Mensaje no pertenece a conversación de admin');
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
						console.log('✅ Suscrito correctamente a mensajes no leídos (admin)');
					} else if (status === 'CHANNEL_ERROR') {
						console.error('❌ Error en canal de mensajes no leídos (admin)');
					} else {
						console.log('Estado del canal (admin):', status);
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
	}, [admin]);

	// Limpiar contador cuando se abre el chat
	const clearUnreadCount = () => {
		setUnreadCount(0);
	};

	return { unreadCount, clearUnreadCount };
}

