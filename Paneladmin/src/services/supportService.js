import { supabase } from '../utils/supabase';

/**
 * Obtiene todas las conversaciones de soporte admin abiertas
 */
export async function getAdminSupportConversations() {
	try {
		const { data, error } = await supabase
			.from('support_conversations')
			.select(`
				*,
				company_users(id, name, username),
				companies(id, name)
			`)
			.eq('conversation_type', 'admin_support')
			.eq('status', 'open')
			.order('updated_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error obteniendo conversaciones admin:', err);
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
 * Envía un mensaje como superadmin
 */
export async function sendAdminMessage(conversationId, adminId, message) {
	try {
		const { data, error } = await supabase
			.from('support_messages')
			.insert({
				conversation_id: conversationId,
				sender_id: adminId,
				sender_type: 'superadmin',
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
export async function markMessagesAsRead(conversationId, adminId) {
	try {
		const { error } = await supabase
			.from('support_messages')
			.update({ read_at: new Date().toISOString() })
			.eq('conversation_id', conversationId)
			.neq('sender_id', adminId)
			.is('read_at', null);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error marcando mensajes como leídos:', err);
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

