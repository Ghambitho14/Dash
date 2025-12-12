import { useState, useCallback } from 'react';
import { authenticateUser } from '../services/authService';

/**
 * Hook para gestionar autenticación
 */
export function useAuth() {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const login = useCallback(async (username, password) => {
		setLoading(true);
		setError('');

		try {
			const user = await authenticateUser(username, password);
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

