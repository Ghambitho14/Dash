import { X, User, Phone, MapPin, Store } from 'lucide-react';
import { useCreateClientForm } from '../hooks/useCreateClientForm';
import '../styles/Components/CreateClientForm.css';

export function CreateClientForm({ onSubmit, onClose, currentUser, localConfigs, initialData }) {
	const {
		name,
		phone,
		address,
		local,
		errors,
		isLocal,
		availableLocales,
		setName,
		setPhone,
		setAddress,
		setLocal,
		handlePhoneChange,
		clearError,
		handleSubmit: handleFormSubmit,
	} = useCreateClientForm(currentUser, localConfigs, initialData);

	const handleSubmit = (e) => {
		const clientData = handleFormSubmit(e);
		if (clientData) {
			onSubmit(clientData);
		}
	};

	return (
		<div className="create-client-form-overlay" onClick={onClose}>
			<div className="create-client-form-content" onClick={(e) => e.stopPropagation()}>
				<div className="create-client-form-header">
					<div className="create-client-form-header-left">
						<div className="create-client-form-header-icon">
							<User />
						</div>
						<div>
							<h2 className="create-client-form-title">{initialData ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
							<p className="create-client-form-subtitle">Completa los datos del cliente</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="create-client-form-close"
						aria-label="Cerrar"
					>
						<X />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="create-client-form">
					<div className="create-client-form-group">
						<label htmlFor="client-name" className="create-client-form-label">
							Nombre del Cliente *
						</label>
						<div className="create-client-form-input-wrapper">
							<User className="create-client-form-input-icon" />
							<input
								id="client-name"
								type="text"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									clearError('name');
								}}
								placeholder="Ej: Juan Pérez"
								className={`create-client-form-input ${errors.name ? 'create-client-form-input-error' : ''}`}
								autoFocus
							/>
						</div>
						{errors.name && (
							<span className="create-client-form-error">{errors.name}</span>
						)}
					</div>

					<div className="create-client-form-group">
						<label htmlFor="client-phone" className="create-client-form-label">
							Teléfono *
						</label>
						<div className="create-client-form-input-wrapper">
							<Phone className="create-client-form-input-icon" />
							<input
								id="client-phone"
								type="tel"
								value={phone}
								onChange={(e) => handlePhoneChange(e.target.value)}
								placeholder="Ej: +56 9 1234 5678"
								className={`create-client-form-input ${errors.phone ? 'create-client-form-input-error' : ''}`}
							/>
						</div>
						{errors.phone && (
							<span className="create-client-form-error">{errors.phone}</span>
						)}
					</div>

					<div className="create-client-form-group">
						<label htmlFor="client-address" className="create-client-form-label">
							Dirección *
						</label>
						<div className="create-client-form-input-wrapper">
							<MapPin className="create-client-form-input-icon" />
							<input
								id="client-address"
								type="text"
								value={address}
								onChange={(e) => {
									setAddress(e.target.value);
									clearError('address');
								}}
								placeholder="Ej: Av. Principal 123, Santiago"
								className={`create-client-form-input ${errors.address ? 'create-client-form-input-error' : ''}`}
							/>
						</div>
					{errors.address && (
						<span className="create-client-form-error">{errors.address}</span>
					)}
				</div>

				{/* Local Assignment */}
				<div className="create-client-form-group">
					<label className="create-client-form-label">
						<div className="create-client-form-label-content">
							<Store />
							Local Asignado *
						</div>
					</label>
					{isLocal ? (
						<div className="create-client-form-local-display">
							{currentUser.local}
						</div>
					) : (
						<div className="create-client-form-local-grid">
							{availableLocales.map((loc) => (
								<button
									key={loc}
									type="button"
									onClick={() => setLocal(loc)}
									className={`create-client-form-local-button ${local === loc ? 'create-client-form-local-button-active' : 'create-client-form-local-button-inactive'}`}
								>
									{loc}
								</button>
							))}
						</div>
					)}
				</div>

				<div className="create-client-form-actions">
						<button
							type="button"
							onClick={onClose}
							className="create-client-form-button create-client-form-button-secondary"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="create-client-form-button create-client-form-button-primary"
						>
							{initialData ? 'Guardar Cambios' : 'Agregar Cliente'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

