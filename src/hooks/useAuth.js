import { useState, useCallback } from 'react';
import { authenticateUser } from '../services/authService';

/**
 * Hook para gestionar autenticación
 */
export function useAuth() {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const login = useCallback(async (usernameOrUser, password) => {
		setLoading(true);
		setError('');

		try {
			// Si el primer parámetro es un objeto, es un usuario ya autenticado (quick login)
			if (typeof usernameOrUser === 'object' && usernameOrUser !== null) {
				setCurrentUser(usernameOrUser);
				return usernameOrUser;
			}

			// Si no, es un username y password (login normal)
			if (typeof usernameOrUser !== 'string') {
				throw new Error('Username debe ser un string');
			}

			const user = await authenticateUser(usernameOrUser, password);
			setCurrentUser(user);
			return user;
		} catch (err) {
			setError(err.message || 'Error al iniciar sesión. Intenta nuevamente.');
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		setCurrentUser(null);
		setError('');
	}, []);

	return {
		currentUser,
		loading,
		error,
		login,
		logout,
	};
}

