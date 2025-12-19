import bcrypt from 'bcryptjs';

/**
 * Hashea una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */
export async function hashPassword(password) {
	if (!password || typeof password !== 'string') {
		throw new Error('La contraseña debe ser un string no vacío');
	}
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica si una contraseña coincide con un hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
export async function verifyPassword(password, hashedPassword) {
	if (!password || !hashedPassword) {
		return false;
	}
	
	// En producción, todas las contraseñas deben estar hasheadas
	const isProduction = import.meta.env.PROD;
	
	// Si el hash parece ser texto plano (no empieza con $2a$, $2b$, $2y$)
	if (!hashedPassword.startsWith('$2')) {
		if (isProduction) {
			// En producción, rechazar contraseñas en texto plano por seguridad
			console.error('⚠️ Intento de autenticación con contraseña en texto plano en producción');
			return false;
		}
		// En desarrollo, permitir para compatibilidad con datos antiguos
		return password === hashedPassword;
	}
	
	return await bcrypt.compare(password, hashedPassword);
}
