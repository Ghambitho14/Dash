import { supabase } from '../utils/supabase';
import { hashPassword } from '../utils/passwordUtils';
import { logger } from '../utils/logger';

/**
 * Crea una solicitud de registro de nueva empresa
 */
export async function createRegistrationRequest(requestData) {
	try {
		// Validar que el username no exista en company_users
		const { data: existingUser, error: userCheckError } = await supabase
			.from('company_users')
			.select('id')
			.eq('username', requestData.username)
			.single();

		if (existingUser) {
			throw new Error('El nombre de usuario ya está en uso');
		}

		// Validar que no haya una solicitud pendiente con el mismo username
		const { data: existingRequest, error: requestCheckError } = await supabase
			.from('registration_requests')
			.select('id, status')
			.eq('username', requestData.username)
			.in('status', ['pending'])
			.single();

		if (existingRequest) {
			throw new Error('Ya existe una solicitud pendiente con este nombre de usuario');
		}

		// Hashear contraseña
		const hashedPassword = await hashPassword(requestData.password);

		// Crear solicitud
		const { data, error } = await supabase
			.from('registration_requests')
			.insert({
				company_name: requestData.companyName,
				username: requestData.username,
				password: hashedPassword,
				name: requestData.name,
				email: requestData.email || null,
				phone: requestData.phone || null,
				status: 'pending',
			})
			.select()
			.single();

		if (error) {
			logger.error('Error creando solicitud de registro:', error);
			throw new Error('Error al enviar la solicitud. Intenta nuevamente.');
		}

		return data;
	} catch (err) {
		logger.error('Error en createRegistrationRequest:', err);
		throw err;
	}
}

