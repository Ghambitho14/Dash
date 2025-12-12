import { supabase } from '../utils/supabase';

/**
 * Autentica un usuario empresarial
 */
export async function authenticateUser(username, password) {
	try {
		// Buscar usuario en Supabase
		const { data, error: queryError } = await supabase
			.from('company_users')
			.select('*')
			.eq('username', username)
			.single();

		if (queryError || !data) {
			throw new Error('Usuario o contraseña incorrectos');
		}

		// Verificar contraseña
		if (data.password !== password) {
			throw new Error('Usuario o contraseña incorrectos');
		}

		// Cargar datos de la empresa si existe company_id
		let companyData = null;
		if (data.company_id) {
			const { data: company, error: companyError } = await supabase
				.from('companies')
				.select('id, name')
				.eq('id', data.company_id)
				.single();
			
			if (!companyError) {
				companyData = company;
			}
		}

		// Cargar datos del local si existe local_id
		let localData = null;
		if (data.local_id) {
			const { data: local, error: localError } = await supabase
				.from('locals')
				.select('id, name')
				.eq('id', data.local_id)
				.single();
			
			if (!localError) {
				localData = local;
			}
		}

		// Formatear usuario para la app
		return {
			id: data.id,
			username: data.username,
			password: data.password,
			name: data.name,
			role: data.role,
			companyId: data.company_id,
			company_id: data.company_id, // Compatibilidad
			companyName: companyData?.name || '',
			local: data.role === 'local' ? localData?.name : null,
			localId: data.local_id,
			_dbId: data.id,
		};
	} catch (err) {
		console.error('Error en autenticación:', err);
		throw err;
	}
}

