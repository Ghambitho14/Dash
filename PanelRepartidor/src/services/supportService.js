import { supabase } from '../utils/supabase';

/**
 * Crea o obtiene una conversación de soporte con admin para un repartidor
 */
export async function getOrCreateDriverSupportConversation(driverId, companyId) {
	try {
		// Buscar conversación existente abierta
		const { data: existing, error: searchError } = await supabase
			.from('support_conversations')
			.select('*')
			.eq('user_id', driverId)
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
				user_id: driverId,
				conversation_type: 'admin_support',
				status: 'open',
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error obteniendo/creando conversación driver:', err);
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
		console.error('Error obteniendo mensajes:', err);
		throw err;
	}
}

/**
 * Envía un mensaje como repartidor
 */
export async function sendDriverMessage(conversationId, driverId, message) {
	try {
		const { data, error } = await supabase
			.from('support_messages')
			.insert({
				conversation_id: conversationId,
				sender_id: driverId,
				sender_type: 'driver',
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
		console.error('Error enviando mensaje:', err);
		throw err;
	}
}

/**
 * Marca mensajes como leídos
 */
export async function markMessagesAsRead(conversationId, driverId) {
	try {
		const { error } = await supabase
			.from('support_messages')
			.update({ read_at: new Date().toISOString() })
			.eq('conversation_id', conversationId)
			.neq('sender_id', driverId)
			.is('read_at', null);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error marcando mensajes como leídos:', err);
		throw err;
	}
}

/**
 * Crea o obtiene una conversación de soporte con el local para un repartidor
 */
export async function getOrCreateLocalSupportConversation(driverId, localId, companyId) {
	try {
		// Buscar conversación existente abierta
		const { data: existing, error: searchError } = await supabase
			.from('support_conversations')
			.select('*')
			.eq('user_id', driverId)
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
				user_id: driverId,
				conversation_type: 'local_support',
				status: 'open',
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error obteniendo/creando conversación local:', err);
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
		console.error('Error cerrando conversación:', err);
		throw err;
	}
}

