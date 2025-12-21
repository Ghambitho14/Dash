import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Hook para rastrear mensajes no leídos de soporte en App Repartidor
 */
export function useUnreadSupportMessages(currentDriver) {
	const [unreadCount, setUnreadCount] = useState(0);
	const channelRef = useRef(null);

	// Cargar mensajes no leídos iniciales
	useEffect(() => {
		if (!currentDriver) {
			setUnreadCount(0);
			return;
		}

		const loadUnreadCount = async () => {
			try {
				const driverId = currentDriver.id;

				// Obtener todas las conversaciones del repartidor
				const { data: conversations, error: convError } = await supabase
					.from('support_conversations')
					.select('id')
					.or(`user_id.eq.${driverId},driver_id.eq.${driverId}`)
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
					.neq('sender_id', driverId)
					.neq('sender_type', 'driver')
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
		if (currentDriver) {
			const driverId = currentDriver.id;

			const channel = supabase
				.channel('driver-unread-support-messages')
				.on(
					'postgres_changes',
					{
						event: 'INSERT',
						schema: 'public',
						table: 'support_messages',
					},
					async (payload) => {
						const newMessage = payload.new;
						console.log('📨 Nuevo mensaje recibido en hook de no leídos (driver):', newMessage);

						// Verificar si el mensaje es del repartidor
						if (newMessage.sender_id === driverId || newMessage.sender_type === 'driver') {
							console.log('Mensaje ignorado: es del repartidor');
							return;
						}

						// Verificar si pertenece a una conversación del repartidor
						const { data: conversation, error: convError } = await supabase
							.from('support_conversations')
							.select('user_id, driver_id')
							.eq('id', newMessage.conversation_id)
							.single();

						if (convError) {
							console.error('Error obteniendo conversación:', convError);
							return;
						}

						if (conversation && (conversation.user_id === driverId || conversation.driver_id === driverId)) {
							console.log('✅ Mensaje pertenece al repartidor, incrementando contador');
							// Verificar si el chat está abierto
							const supportModal = document.querySelector('.support-chat-container');
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
							console.log('Mensaje no pertenece al repartidor');
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
						console.log('✅ Suscrito correctamente a mensajes no leídos (driver)');
					} else if (status === 'CHANNEL_ERROR') {
						console.error('❌ Error en canal de mensajes no leídos (driver)');
					} else {
						console.log('Estado del canal (driver):', status);
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
	}, [currentDriver]);

	// Limpiar contador cuando se abre el chat
	const clearUnreadCount = () => {
		setUnreadCount(0);
	};

	return { unreadCount, clearUnreadCount };
}

