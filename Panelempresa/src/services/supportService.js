import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Crea o obtiene una conversación de soporte con cajera del local
 */
export async function getOrCreateLocalSupportConversation(userId, localId, companyId) {
	try {
		// Buscar conversación existente abierta
		const { data: existing, error: searchError } = await supabase
			.from('support_conversations')
			.select('*')
			.eq('user_id', userId)
			.eq('local_id', localId)
			.eq('conversation_type', 'local_support')
			.eq('status', 'open')
			.single();

		if (existing && !searchError) {
			return existing;
		}

		// Crear nueva conversación
		const { data, error } = await supabase
			.from('support_conversations')
			.insert({
				company_id: companyId,
				local_id: localId,
				user_id: userId,
				conversation_type: 'local_support',
				status: 'open',
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		logger.error('Error obteniendo/creando conversación local:', err);
		throw err;
	}
}

/**
 * Crea o obtiene una conversación de soporte con admin
 */
export async function getOrCreateAdminSupportConversation(userId, companyId) {
	try {
		// Buscar conversación existente abierta
		const { data: existing, error: searchError } = await supabase
			.from('support_conversations')
			.select('*')
			.eq('user_id', userId)
			.eq('conversation_type', 'admin_support')
			.eq('status', 'open')
			.single();

		if (existing && !searchError) {
			return existing;
		}

		// Crear nueva conversación
		const { data, error } = await supabase
			.from('support_conversations')
			.insert({
				company_id: companyId,
				user_id: userId,
				conversation_type: 'admin_support',
				status: 'open',
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		logger.error('Error obteniendo/creando conversación admin:', err);
		throw err;
	}
}

/**
 * Obtiene todas las conversaciones de un usuario
 */
export async function getUserConversations(userId) {
	try {
		const { data, error } = await supabase
			.from('support_conversations')
			.select('*')
			.eq('user_id', userId)
			.order('updated_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		logger.error('Error obteniendo conversaciones:', err);
		throw err;
	}
}

/**
 * Obtiene los mensajes de una conversación
 */
export async function getConversationMessages(conversationId) {
	try {
		const { data, error } = await supabase
			.from('support_messages')
			.select('*')
			.eq('conversation_id', conversationId)
			.order('created_at', { ascending: true });

		if (error) throw error;
		return data || [];
	} catch (err) {
		logger.error('Error obteniendo mensajes:', err);
		throw err;
	}
}

/**
 * Envía un mensaje en una conversación
 */
export async function sendMessage(conversationId, senderId, senderType, message) {
	try {
		const { data, error } = await supabase
			.from('support_messages')
			.insert({
				conversation_id: conversationId,
				sender_id: senderId,
				sender_type: senderType,
				message: message,
			})
			.select()
			.single();

		if (error) throw error;

		// Actualizar updated_at de la conversación
		await supabase
			.from('support_conversations')
			.update({ updated_at: new Date().toISOString() })
			.eq('id', conversationId);

		return data;
	} catch (err) {
		logger.error('Error enviando mensaje:', err);
		throw err;
	}
}

/**
 * Marca mensajes como leídos
 */
export async function markMessagesAsRead(conversationId, userId) {
	try {
		const { error } = await supabase
			.from('support_messages')
			.update({ read_at: new Date().toISOString() })
			.eq('conversation_id', conversationId)
			.neq('sender_id', userId)
			.is('read_at', null);

		if (error) throw error;
		return true;
	} catch (err) {
		logger.error('Error marcando mensajes como leídos:', err);
		throw err;
	}
}

/**
 * Cierra una conversación
 */
export async function closeConversation(conversationId) {
	try {
		const { error } = await supabase
			.from('support_conversations')
			.update({ status: 'closed' })
			.eq('id', conversationId);

		if (error) throw error;
		return true;
	} catch (err) {
		logger.error('Error cerrando conversación:', err);
		throw err;
	}
}

/**
 * Obtiene usuarios cajeras de un local (usuarios con rol 'local' del mismo local)
 */
export async function getLocalCashiers(localId) {
	try {
		const { data, error } = await supabase
			.from('company_users')
			.select('id, name, username')
			.eq('local_id', localId)
			.eq('role', 'local')
			.eq('active', true);

		if (error) throw error;
		return data || [];
	} catch (err) {
		logger.error('Error obteniendo cajeras:', err);
		throw err;
	}
}

/**
 * Obtiene repartidores con pedidos activos de una empresa
 */
export async function getDriversWithActiveOrders(companyId) {
	try {
		const { data, error } = await supabase
			.from('orders')
			.select(`
				driver_id,
				drivers(id, name, phone),
				status
			`)
			.eq('company_id', companyId)
			.not('driver_id', 'is', null)
			.neq('status', 'Entregado')
			.neq('status', 'Pendiente');

		if (error) throw error;

		// Agrupar por repartidor y contar pedidos
		const driversMap = new Map();
		(data || []).forEach(order => {
			if (order.driver_id && order.drivers) {
				const driverId = order.driver_id;
				if (!driversMap.has(driverId)) {
					driversMap.set(driverId, {
						id: driverId,
						name: order.drivers.name,
						phone: order.drivers.phone,
						activeOrdersCount: 0,
					});
				}
				driversMap.get(driverId).activeOrdersCount++;
			}
		});

		return Array.from(driversMap.values());
	} catch (err) {
		logger.error('Error obteniendo repartidores con pedidos:', err);
		throw err;
	}
}

/**
 * Crea o obtiene una conversación de soporte con un repartidor
 */
export async function getOrCreateDriverSupportConversation(userId, driverId, companyId) {
	try {
		// Buscar conversación existente abierta con este repartidor
		const { data: existing, error: searchError } = await supabase
			.from('support_conversations')
			.select('*')
			.eq('user_id', userId)
			.eq('driver_id', driverId)
			.eq('conversation_type', 'driver_support')
			.eq('status', 'open')
			.single();

		if (existing && !searchError) {
			return existing;
		}

		// Crear nueva conversación
		const { data, error } = await supabase
			.from('support_conversations')
			.insert({
				company_id: companyId,
				user_id: userId,
				driver_id: driverId,
				conversation_type: 'driver_support',
				status: 'open',
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		logger.error('Error obteniendo/creando conversación con repartidor:', err);
		throw err;
	}
}

