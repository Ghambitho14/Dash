import { useState } from 'react';
import { LogIn, Lock, Mail } from 'lucide-react';
import { supabase } from '../utils/supabase';
import '../style/Login.css';

export function Login({ onLogin }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			// Buscar el superadmin en la base de datos
			const { data, error: queryError } = await supabase
				.from('superadmins')
				.select('*')
				.eq('email', email)
				.eq('active', true)
				.single();

			if (queryError || !data) {
				setError('Credenciales incorrectas');
				setLoading(false);
				return;
			}

			// Verificar contraseña (en producción debería estar hasheada)
			if (data.password !== password) {
				setError('Credenciales incorrectas');
				setLoading(false);
				return;
			}

			// Login exitoso
			onLogin(data);
		} catch (err) {
			setError('Error al iniciar sesión. Intenta nuevamente.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-login">
			<div className="admin-login-container">
				<div className="admin-login-header">
					<LogIn className="admin-login-icon" />
					<h1>Panel de Administración</h1>
					<p>Inicia sesión para continuar</p>
				</div>

				<form onSubmit={handleSubmit} className="admin-login-form">
					{error && (
						<div className="admin-login-error">
							{error}
						</div>
					)}

					<div className="admin-login-field">
						<label htmlFor="email">
							<Mail />
							Correo Electrónico
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="tu@email.com"
							required
							disabled={loading}
						/>
					</div>

					<div className="admin-login-field">
						<label htmlFor="password">
							<Lock />
							Contraseña
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							disabled={loading}
						/>
					</div>

					<button
						type="submit"
						className="admin-login-button"
						disabled={loading}
					>
						{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
					</button>
				</form>
			</div>
		</div>
	);
}

