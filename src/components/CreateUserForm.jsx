import { X, User, Lock, Store, Shield, Crown } from 'lucide-react';
import { useCreateUserForm } from '../hooks/useCreateUserForm';
import '../styles/Components/CreateUserForm.css';

export function CreateUserForm({ onSubmit, onClose, localConfigs, existingUsers, initialData }) {
	const {
		username,
		password,
		confirmPassword,
		name,
		role,
		local,
		errors,
		availableLocales,
		gridClass,
		setUsername,
		setPassword,
		setConfirmPassword,
		setName,
		handleRoleChange,
		handleLocalChange,
		clearError,
		handleSubmit: handleFormSubmit,
	} = useCreateUserForm(localConfigs, existingUsers, initialData);

	const handleSubmit = (e) => {
		const userData = handleFormSubmit(e);
		if (userData) {
			onSubmit(userData);
		}
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
									clearError('username');
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
									clearError('password');
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
									clearError('confirmPassword');
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
									clearError('name');
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
								onClick={() => handleRoleChange('empresarial')}
								className={`create-user-form-role-button ${role === 'empresarial' ? 'create-user-form-role-button-active' : 'create-user-form-role-button-inactive'}`}
							>
								<Crown />
								CEO
							</button>
							<button
								type="button"
								onClick={() => handleRoleChange('admin')}
								className={`create-user-form-role-button ${role === 'admin' ? 'create-user-form-role-button-active' : 'create-user-form-role-button-inactive'}`}
							>
								<Shield />
								Administrador
							</button>
							<button
								type="button"
								onClick={() => handleRoleChange('local')}
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
									<div className={`create-user-form-local-grid ${gridClass}`}>
										{availableLocales.map((loc) => (
											<button
												key={loc}
												type="button"
												onClick={() => handleLocalChange(loc)}
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

