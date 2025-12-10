import { useState, useEffect, useMemo } from 'react';
import { X, User, Lock, Store, Shield, Crown } from 'lucide-react';
import { User as UserType, UserRole } from '../types/user';
import { Local } from '../types/order';
import { LocalConfig } from '../utils/localConfig';
import { getRoleName } from '../utils/roleUtils';
import '../styles/Components/CreateUserForm.css';

interface CreateUserFormProps {
	onSubmit: (userData: Omit<UserType, 'id'>) => void;
	onClose: () => void;
	localConfigs: LocalConfig[];
	existingUsers: UserType[];
	initialData?: {
		id: string;
		username: string;
		password: string;
		name: string;
		role: UserRole;
		local?: Local;
	};
}

export function CreateUserForm({ onSubmit, onClose, localConfigs, existingUsers, initialData }: CreateUserFormProps) {
	const availableLocales = useMemo(() => localConfigs.map(config => config.name), [localConfigs]);

	const [username, setUsername] = useState(initialData?.username || '');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [name, setName] = useState(initialData?.name || '');
	const [role, setRole] = useState<UserRole>(initialData?.role || 'local');
	const [local, setLocal] = useState<Local | undefined>(initialData?.local || (availableLocales.length > 0 ? availableLocales[0] : undefined));
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		if (initialData) {
			setUsername(initialData.username);
			setPassword('');
			setConfirmPassword('');
			setName(initialData.name);
			setRole(initialData.role);
			setLocal(initialData.local);
		} else {
			setUsername('');
			setPassword('');
			setConfirmPassword('');
			setName('');
			setRole('local');
			setLocal(availableLocales.length > 0 ? availableLocales[0] : undefined);
		}
		setErrors({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialData?.id, availableLocales.length]);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!username.trim()) {
			newErrors.username = 'El usuario es requerido';
		} else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
			newErrors.username = 'El usuario solo puede contener letras, números y guiones bajos';
		} else if (existingUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase() && (!initialData || u.id !== initialData.id))) {
			newErrors.username = 'Este usuario ya existe';
		}

		if (!initialData) {
			// Solo validar password en creación, no en edición
			if (!password.trim()) {
				newErrors.password = 'La contraseña es requerida';
			} else if (password.length < 6) {
				newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
			}

			if (!confirmPassword.trim()) {
				newErrors.confirmPassword = 'Confirma la contraseña';
			} else if (password !== confirmPassword) {
				newErrors.confirmPassword = 'Las contraseñas no coinciden';
			}
		} else {
			// En edición, validar password solo si se ingresó
			if (password.trim() || confirmPassword.trim()) {
				if (password.length < 6) {
					newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
				}
				if (password !== confirmPassword) {
					newErrors.confirmPassword = 'Las contraseñas no coinciden';
				}
			}
		}

		if (!name.trim()) {
			newErrors.name = 'El nombre es requerido';
		}

		if (role === 'local') {
			if (availableLocales.length === 0) {
				newErrors.local = 'Primero debes crear locales en "Configurar Locales"';
			} else if (!local) {
				newErrors.local = 'Debes seleccionar un local para usuarios de tipo local';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			const userData: Omit<UserType, 'id'> = {
				username: username.trim(),
				password: password.trim() || initialData?.password || '', // Mantener password anterior si no se cambia
				role: role,
				local: role === 'local' ? local : undefined,
				name: name.trim(),
			};
			onSubmit(userData);
			if (!initialData) {
				setUsername('');
				setPassword('');
				setConfirmPassword('');
				setName('');
				setRole('local');
				setLocal(availableLocales[0]);
			}
			setErrors({});
		}
	};

	const getGridClass = () => {
		if (availableLocales.length <= 3) return 'create-user-form-local-grid-3';
		if (availableLocales.length <= 4) return 'create-user-form-local-grid-4';
		return 'create-user-form-local-grid-5';
	};

	return (
		<div className="create-user-form-overlay" onClick={onClose}>
			<div className="create-user-form-content" onClick={(e) => e.stopPropagation()}>
				<div className="create-user-form-header">
					<div className="create-user-form-header-left">
						<div className="create-user-form-header-icon">
							<User />
						</div>
						<div>
							<h2 className="create-user-form-title">{initialData ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
							<p className="create-user-form-subtitle">Completa los datos del usuario</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="create-user-form-close"
						aria-label="Cerrar"
					>
						<X />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="create-user-form">
					<div className="create-user-form-group">
						<label htmlFor="user-username" className="create-user-form-label">
							Usuario *
						</label>
						<div className="create-user-form-input-wrapper">
							<User className="create-user-form-input-icon" />
							<input
								id="user-username"
								type="text"
								value={username}
								onChange={(e) => {
									setUsername(e.target.value);
									if (errors.username) setErrors({ ...errors, username: '' });
								}}
								placeholder="Ej: usuario123"
								className={`create-user-form-input ${errors.username ? 'create-user-form-input-error' : ''}`}
								autoFocus
								disabled={!!initialData}
							/>
						</div>
						{errors.username && (
							<span className="create-user-form-error">{errors.username}</span>
						)}
						{initialData && (
							<p className="create-user-form-hint">El usuario no se puede modificar</p>
						)}
					</div>

					<div className="create-user-form-group">
						<label htmlFor="user-password" className="create-user-form-label">
							Contraseña {initialData ? '(dejar vacío para mantener)' : '*'}
						</label>
						<div className="create-user-form-input-wrapper">
							<Lock className="create-user-form-input-icon" />
							<input
								id="user-password"
								type="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (errors.password) setErrors({ ...errors, password: '' });
								}}
								placeholder={initialData ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
								className={`create-user-form-input ${errors.password ? 'create-user-form-input-error' : ''}`}
							/>
						</div>
						{errors.password && (
							<span className="create-user-form-error">{errors.password}</span>
						)}
					</div>

					<div className="create-user-form-group">
						<label htmlFor="user-confirm-password" className="create-user-form-label">
							Confirmar Contraseña {initialData ? '(dejar vacío para mantener)' : '*'}
						</label>
						<div className="create-user-form-input-wrapper">
							<Lock className="create-user-form-input-icon" />
							<input
								id="user-confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
								}}
								placeholder={initialData ? "Dejar vacío para mantener" : "Confirma la contraseña"}
								className={`create-user-form-input ${errors.confirmPassword ? 'create-user-form-input-error' : ''}`}
							/>
						</div>
						{errors.confirmPassword && (
							<span className="create-user-form-error">{errors.confirmPassword}</span>
						)}
					</div>

					<div className="create-user-form-group">
						<label htmlFor="user-name" className="create-user-form-label">
							Nombre Completo *
						</label>
						<div className="create-user-form-input-wrapper">
							<User className="create-user-form-input-icon" />
							<input
								id="user-name"
								type="text"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (errors.name) setErrors({ ...errors, name: '' });
								}}
								placeholder="Ej: Juan Pérez"
								className={`create-user-form-input ${errors.name ? 'create-user-form-input-error' : ''}`}
							/>
						</div>
						{errors.name && (
							<span className="create-user-form-error">{errors.name}</span>
						)}
					</div>

					<div className="create-user-form-group">
						<label className="create-user-form-label">
							<div className="create-user-form-label-content">
								<Shield />
								Rol *
							</div>
						</label>
						<div className="create-user-form-role-buttons create-user-form-role-buttons-3">
							<button
								type="button"
								onClick={() => {
									setRole('empresarial');
									setLocal(undefined);
									if (errors.local) setErrors({ ...errors, local: '' });
								}}
								className={`create-user-form-role-button ${role === 'empresarial' ? 'create-user-form-role-button-active' : 'create-user-form-role-button-inactive'}`}
							>
								<Crown />
								CEO
							</button>
							<button
								type="button"
								onClick={() => {
									setRole('admin');
									setLocal(undefined);
									if (errors.local) setErrors({ ...errors, local: '' });
								}}
								className={`create-user-form-role-button ${role === 'admin' ? 'create-user-form-role-button-active' : 'create-user-form-role-button-inactive'}`}
							>
								<Shield />
								Administrador
							</button>
							<button
								type="button"
								onClick={() => {
									setRole('local');
									setLocal(availableLocales.length > 0 ? availableLocales[0] : undefined);
								}}
								className={`create-user-form-role-button ${role === 'local' ? 'create-user-form-role-button-active' : 'create-user-form-role-button-inactive'}`}
							>
								<Store />
								Local
							</button>
						</div>
					</div>

					{role === 'local' && (
						<div className="create-user-form-group">
							<label className="create-user-form-label">
								<div className="create-user-form-label-content">
									<Store />
									Local Asignado *
								</div>
							</label>
							{availableLocales.length === 0 ? (
								<div className="create-user-form-no-locals">
									<p className="create-user-form-no-locals-text">
										No hay locales creados. Por favor, crea locales primero en "Configurar Locales".
									</p>
								</div>
							) : (
								<>
									<div className={`create-user-form-local-grid ${getGridClass()}`}>
										{availableLocales.map((loc) => (
											<button
												key={loc}
												type="button"
												onClick={() => {
													setLocal(loc);
													if (errors.local) setErrors({ ...errors, local: '' });
												}}
												className={`create-user-form-local-button ${local === loc ? 'create-user-form-local-button-active' : 'create-user-form-local-button-inactive'}`}
											>
												{loc}
											</button>
										))}
									</div>
									{errors.local && (
										<span className="create-user-form-error">{errors.local}</span>
									)}
								</>
							)}
						</div>
					)}

					<div className="create-user-form-actions">
						<button
							type="button"
							onClick={onClose}
							className="create-user-form-button create-user-form-button-secondary"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="create-user-form-button create-user-form-button-primary"
						>
							{initialData ? 'Guardar Cambios' : 'Agregar Usuario'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

