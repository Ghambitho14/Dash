import { useState } from 'react';
import { mockDrivers } from '../types/driver';
import { supabase } from '../utils/supabase';
import { Bike, Lock, User as UserIcon, LogIn } from 'lucide-react';
import '../styles/Components/Login.css';

export function Login({ onLogin }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			// Buscar repartidor en Supabase
			const { data, error: queryError } = await supabase
				.from('drivers')
				.select('*')
				.eq('username', username)
				.eq('active', true)
				.single();

			if (queryError) {
				console.error('Error buscando repartidor:', queryError);
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			if (!data) {
				console.error('Repartidor no encontrado');
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			console.log('Repartidor encontrado:', { id: data.id, username: data.username, active: data.active, company_id: data.company_id });

			// Verificar contraseña
			if (data.password !== password) {
				console.error('Contraseña incorrecta');
				setError('Usuario o contraseña incorrectos');
				setLoading(false);
				return;
			}

			// Formatear driver para la app
			const driver = {
				id: data.id,
				username: data.username,
				password: data.password,
				name: data.name,
				phone: data.phone || '',
				email: data.email || '',
				active: data.active,
				companyId: data.company_id,
				company_id: data.company_id, // También mantener company_id para compatibilidad
			};

			console.log('Driver formateado:', driver);

			console.log('Repartidor formateado para login:', driver);
			onLogin(driver);
		} catch (err) {
			setError('Error al iniciar sesión. Intenta nuevamente.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleQuickLogin = (driver) => {
		onLogin(driver);
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

					{/* Quick Login (solo en desarrollo) */}
					{import.meta.env.DEV && (
						<div className="driver-login-quick">
							<p className="driver-login-quick-title">Acceso rápido (solo desarrollo):</p>
							<div className="driver-login-quick-buttons">
								{mockDrivers.map((driver) => (
									<button
										key={driver.id}
										type="button"
										onClick={() => handleQuickLogin(driver)}
										className="driver-login-quick-button"
									>
										{driver.name}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

