import { useState } from 'react';
import { authenticateUser } from '../services/authService';

/**
 * Hook para gestionar la lógica de login
 */
export function useLogin(onLogin) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const user = await authenticateUser(username, password);
			onLogin(user);
		} catch (err) {
			setError(err.message || 'Error al iniciar sesión. Intenta nuevamente.');
			console.error('Error en login:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleQuickLogin = (user) => {
		onLogin(user);
	};

	return {
		username,
		password,
		error,
		loading,
		setUsername,
		setPassword,
		handleSubmit,
		handleQuickLogin,
	};
}

