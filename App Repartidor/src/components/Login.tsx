import { useState } from 'react';
import { Driver, mockDrivers } from '../types/driver';
import { Bike, Lock, User as UserIcon, LogIn } from 'lucide-react';
import '../styles/Components/Login.css';

interface LoginProps {
	onLogin: (driver: Driver) => void;
}

export function Login({ onLogin }: LoginProps) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		const driver = mockDrivers.find(
			d => d.username === username && d.password === password && d.active
		);

		if (driver) {
			onLogin(driver);
		} else {
			setError('Usuario o contraseña incorrectos');
		}
	};

	const handleQuickLogin = (driver: Driver) => {
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

						<button type="submit" className="driver-login-button">
							<LogIn />
							Iniciar Sesión
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

