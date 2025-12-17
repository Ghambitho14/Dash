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
	
	// Si el hash parece ser texto plano (no empieza con $2a$, $2b$, $2y$), comparar directamente
	// Esto es para compatibilidad con contraseñas antiguas sin hashear
	if (!hashedPassword.startsWith('$2')) {
		return password === hashedPassword;
	}
	
	return await bcrypt.compare(password, hashedPassword);
}

