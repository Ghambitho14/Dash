import { useState } from 'react';
import { supabase } from '../utils/supabase';

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
			// Buscar usuario en Supabase
			const { data, error: queryError } = await supabase
				.from('company_users')
				.select('*')
				.eq('username', username)
				.single();

			if (queryError) {
				console.error('Error buscando usuario:', queryError);
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			if (!data) {
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			console.log('Usuario encontrado:', { id: data.id, username: data.username, company_id: data.company_id });

			// Verificar contraseña
			if (data.password !== password) {
				console.error('Contraseña incorrecta');
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
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
			const user = {
				id: data.id,
				username: data.username,
				password: data.password,
				name: data.name,
				role: data.role,
				companyId: data.company_id,
				company_id: data.company_id,
				companyName: companyData?.name || '',
				local: data.role === 'local' ? localData?.name : null,
				localId: data.local_id,
				_dbId: data.id,
			};

			console.log('Usuario formateado para login:', user);
			onLogin(user);
		} catch (err) {
			setError('Error al iniciar sesión. Intenta nuevamente.');
			console.error(err);
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

