import { supabase } from '../utils/supabase';

/**
 * Formatea un usuario de la base de datos al formato de la aplicación
 */
export function formatUser(user) {
	return {
		...user,
		id: `USR-${user.id}`,
		local: user.role === 'local' ? user.locals?.name : null,
		_dbId: user.id,
		_dbLocalId: user.local_id,
	};
}

/**
 * Carga usuarios desde Supabase
 */
export async function loadUsers(companyId) {
	try {
		const { data, error } = await supabase
			.from('company_users')
			.select('*, locals(name)')
			.eq('company_id', companyId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return (data || []).map(formatUser);
	} catch (err) {
		console.error('Error cargando usuarios:', err);
		throw err;
	}
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(userData, companyId, localId = null) {
	try {
		const { data, error } = await supabase
			.from('company_users')
			.insert({
				company_id: companyId,
				username: userData.username,
				password: userData.password,
				role: userData.role,
				name: userData.name,
				local_id: localId,
			})
			.select('*, locals(name)')
			.single();

		if (error) throw error;
		return formatUser(data);
	} catch (err) {
		console.error('Error creando usuario:', err);
		throw err;
	}
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(userDbId, userData, localId = null) {
	try {
		const { error } = await supabase
			.from('company_users')
			.update({
				username: userData.username,
				password: userData.password,
				role: userData.role,
				name: userData.name,
				local_id: localId,
			})
			.eq('id', userDbId);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error actualizando usuario:', err);
		throw err;
	}
}

/**
 * Elimina un usuario
 */
export async function deleteUser(userDbId) {
	try {
		const { error } = await supabase
			.from('company_users')
			.delete()
			.eq('id', userDbId);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error eliminando usuario:', err);
		throw err;
	}
}

