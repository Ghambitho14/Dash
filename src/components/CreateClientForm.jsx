import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Store } from 'lucide-react';
// LocalConfig type removed - using plain objects in JavaScript
import '../styles/Components/CreateClientForm.css';

export function CreateClientForm({ onSubmit, onClose, currentUser, localConfigs, initialData }) {
	const isLocal = currentUser.role === 'local' && currentUser.local;
	const availableLocales = isLocal 
		? [currentUser.local]
		: localConfigs.map(config => config.name);
	
	const initialLocal = isLocal ? currentUser.local : (initialData?.local || localConfigs[0]?.name || '');

	const [name, setName] = useState(initialData?.name || '');
	const [phone, setPhone] = useState(initialData?.phone || '');
	const [address, setAddress] = useState(initialData?.address || '');
	const [local, setLocal] = useState(initialData?.local || initialLocal);
	const [errors, setErrors] = useState({});

	// Actualizar valores cuando cambia initialData (modo edición)
	useEffect(() => {
		if (initialData) {
			setName(initialData.name);
			setPhone(initialData.phone);
			setAddress(initialData.address);
			setLocal(initialData.local);
		} else {
			setName('');
			setPhone('');
			setAddress('');
			setLocal(initialLocal);
		}
		setErrors({});
	}, [initialData, initialLocal]);

	const validateForm = () => {
		const newErrors = {};

		if (!name.trim()) {
			newErrors.name = 'El nombre es requerido';
		}

		if (!phone.trim()) {
			newErrors.phone = 'El teléfono es requerido';
		} else if (!/^\+?[\d\s-()]+$/.test(phone.trim())) {
			newErrors.phone = 'El teléfono no es válido';
		}

		if (!address.trim()) {
			newErrors.address = 'La dirección es requerida';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (validateForm()) {
			onSubmit({
				name: name.trim(),
				phone: phone.trim(),
				address: address.trim(),
				local: local,
			});
			// Reset form solo si no es edición
			if (!initialData) {
				setName('');
				setPhone('');
				setAddress('');
				setLocal(initialLocal);
			}
			setErrors({});
		}
	};

	const handlePhoneChange = (value) => {
		// Permitir solo números, espacios, guiones, paréntesis y el signo +
		const cleaned = value.replace(/[^\d\s\-()+]/g, '');
		setPhone(cleaned);
		if (errors.phone) {
			setErrors({ ...errors, phone: '' });
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
									if (errors.name) {
										setErrors({ ...errors, name: '' });
									}
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
									if (errors.address) {
										setErrors({ ...errors, address: '' });
									}
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

