import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { verifyPassword } from '../utils/passwordUtils';
import { Bike, Lock, User as UserIcon, LogIn } from 'lucide-react';
import '../styles/Components/Login.css';

export function Login({ onLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const validateInputs = () => {
		if (!username.trim()) {
			setError('El usuario es requerido');
			return false;
		}
		if (!password.trim()) {
			setError('La contraseña es requerida');
			return false;
		}
		if (password.length < 6) {
			setError('La contraseña debe tener al menos 6 caracteres');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		// Validar entradas
		if (!validateInputs()) {
			return;
		}

		setLoading(true);

		try {
			// Buscar repartidor en Supabase
			const { data, error: queryError } = await supabase
				.from('drivers')
				.select('*')
				.eq('username', username.trim())
				.eq('active', true)
				.single();

			if (queryError || !data) {
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			// Verificar contraseña usando bcrypt
			const isPasswordValid = await verifyPassword(password, data.password);
			if (!isPasswordValid) {
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			// Formatear driver para la app (sin incluir password por seguridad)
			const driver = {
				id: data.id,
				username: data.username,
				name: data.name,
				phone: data.phone || '',
				email: data.email || '',
				active: data.active,
				companyId: data.company_id,
				company_id: data.company_id, // También mantener company_id para compatibilidad
			};

			onLogin(driver);
		} catch (err) {
			setError('Error al iniciar sesión. Intenta nuevamente.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="driver-login-container">
			<div className="driver-login-wrapper">
				{/* Logo/Header */}
				<div className="driver-login-header">
					<div className="driver-login-logo">
						<Bike />
					</div>
					<h1 className="driver-login-title">App Repartidor</h1>
					<p className="driver-login-subtitle">Inicia sesión para comenzar</p>
				</div>

				{/* Login Form */}
				<div className="driver-login-form-container">
					<form onSubmit={handleSubmit} className="driver-login-form">
						<div className="driver-login-form-group">
							<label className="driver-login-label">
								<div className="driver-login-label-content">
									<UserIcon />
									Usuario
								</div>
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => {
									setUsername(e.target.value);
									setError('');
								}}
								placeholder="Ingresa tu usuario"
								className={`driver-login-input ${error ? 'driver-login-input-error' : ''}`}
								autoComplete="username"
								required
							/>
						</div>

						<div className="driver-login-form-group">
							<label className="driver-login-label">
								<div className="driver-login-label-content">
									<Lock />
									Contraseña
								</div>
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									setError('');
								}}
								placeholder="Ingresa tu contraseña"
								className={`driver-login-input ${error ? 'driver-login-input-error' : ''}`}
								autoComplete="current-password"
								required
							/>
						</div>

						{error && (
							<div className="driver-login-error">
								{error}
							</div>
						)}

						<button type="submit" className="driver-login-button" disabled={loading}>
							<LogIn />
							{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

