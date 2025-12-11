import { useState } from 'react';
import { Building2, Lock, User as UserIcon, LogIn } from 'lucide-react';
import { isAdminOrEmpresarial } from '../utils/utils';
import { supabase } from '../utils/supabase';
import '../styles/Components/Login.css';

export function Login({ onLogin, users }) {
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
				companyId: data.company_id, // Asegurar que company_id se pase como companyId
				company_id: data.company_id, // También mantener company_id para compatibilidad
				companyName: companyData?.name || '',
				local: data.role === 'local' ? localData?.name : null,
				localId: data.local_id,
				_dbId: data.id, // ID de la base de datos
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

	return (
		<div className="login-container">
			<div className="login-wrapper">
				{/* Logo/Header */}
				<div className="login-header">
					<div className="login-logo">
						<Building2 />
					</div>
					<h1 className="login-title">Sistema de Delivery</h1>
					<p className="login-subtitle">Panel de Gestión de Pedidos</p>
				</div>

				{/* Login Form */}
				<div className="login-form-container">
					<form onSubmit={handleSubmit} className="login-form">
						<div className="login-form-group">
							<label className="login-label">
								<div className="login-label-content">
									<UserIcon style={{ width: '1rem', height: '1rem' }} />
									Usuario
								</div>
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="login-input"
								placeholder="Ingresa tu usuario"
								required
							/>
						</div>

						<div className="login-form-group">
							<label className="login-label">
								<div className="login-label-content">
									<Lock style={{ width: '1rem', height: '1rem' }} />
									Contraseña
								</div>
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="login-input"
								placeholder="Ingresa tu contraseña"
								required
							/>
						</div>

						{error && (
							<div className="login-error">
								{error}
							</div>
						)}

						<button
							type="submit"
							className="login-button"
							disabled={loading}
						>
							<LogIn style={{ width: '1.25rem', height: '1.25rem' }} />
							{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
						</button>
					</form>
				</div>

				{/* Quick Login Buttons */}
				{users.length > 0 && (
					<div className="quick-login-container">
						<p className="quick-login-title">Acceso rápido para pruebas:</p>
						
						<div className="quick-login-buttons">
							{users.find(u => u.role === 'empresarial') && (
								<button
									onClick={() => handleQuickLogin(users.find(u => u.role === 'empresarial'))}
									className="quick-login-button-admin"
								>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<div>
											<p>👑 <strong>CEO</strong></p>
											<p style={{ color: '#9333ea' }}>{users.find(u => u.role === 'empresarial').username}</p>
										</div>
									</div>
								</button>
							)}
							{users.find(u => u.role === 'admin') && (
								<button
									onClick={() => handleQuickLogin(users.find(u => u.role === 'admin'))}
									className="quick-login-button-admin"
								>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
										<div>
											<p>🛡️ <strong>Administrador</strong></p>
											<p style={{ color: '#9333ea' }}>{users.find(u => u.role === 'admin').username}</p>
										</div>
									</div>
								</button>
							)}

							{users.filter(u => u.role === 'local').length > 0 && (
								<div className="quick-login-grid">
									{users.filter(u => u.role === 'local').map((user) => (
										<button
											key={user.id}
											onClick={() => handleQuickLogin(user)}
											className="quick-login-button"
										>
											<p><strong>{user.local}</strong></p>
											<p className="quick-login-button-text">{user.username}</p>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

