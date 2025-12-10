import { useState } from 'react';
import { LocalConfig } from '../utils/localConfig';
import { X, Plus, Trash2, MapPin, Store } from 'lucide-react';
import '../styles/Components/LocalSettings.css';

interface LocalSettingsProps {
	onClose: () => void;
	onSave: (locals: LocalConfig[]) => void;
	initialLocals: LocalConfig[];
}

export function LocalSettings({ onClose, onSave, initialLocals }: LocalSettingsProps) {
	const [locals, setLocals] = useState<LocalConfig[]>(initialLocals);

	const handleAddLocal = () => {
		const newLocalNumber = locals.length + 1;
		setLocals([
			...locals,
			{
				name: `Local ${newLocalNumber}`,
				address: '',
			},
		]);
	};

	const handleDeleteLocal = (index: number) => {
		if (window.confirm('¿Estás seguro de que deseas eliminar este local?')) {
			setLocals(locals.filter((_, i) => i !== index));
		}
	};

	const handleUpdateLocal = (index: number, field: 'name' | 'address', value: string) => {
		setLocals(locals.map((local, i) => 
			i === index ? { ...local, [field]: value } : local
		));
	};

	const handleSave = () => {
		onSave(locals);
		onClose();
	};

	return (
		<div className="local-settings">
			{/* Header */}
			<div className="local-settings-header">
				<div className="local-settings-header-content">
					<h3>Configuración de Locales</h3>
					<p>Gestiona los locales y sus direcciones</p>
				</div>
				<button
					onClick={onClose}
					className="local-settings-close"
				>
					<X />
				</button>
			</div>

			{/* Locales List */}
			<div className="local-settings-list">
				{locals.map((local, index) => (
					<div key={index} className="local-settings-item">
						<div className="local-settings-item-header">
							<div className="local-settings-item-title">
								<Store />
								<span className="local-settings-item-title-text">Local {index + 1}</span>
							</div>
							{locals.length > 1 && (
								<button
									onClick={() => handleDeleteLocal(index)}
									className="local-settings-item-delete"
									title="Eliminar local"
								>
									<Trash2 />
								</button>
							)}
						</div>

						<div className="local-settings-item-fields">
							{/* Nombre del Local */}
							<div className="local-settings-item-field">
								<label className="local-settings-item-label">Nombre del Local</label>
								<input
									type="text"
									value={local.name}
									onChange={(e) => handleUpdateLocal(index, 'name', e.target.value)}
									placeholder="Ej: Local 1"
									className="local-settings-item-input"
								/>
							</div>

							{/* Dirección del Local */}
							<div className="local-settings-item-field">
								<label className="local-settings-item-label">
									<div className="local-settings-item-label-content">
										<MapPin />
										Dirección del Local
									</div>
								</label>
								<input
									type="text"
									value={local.address}
									onChange={(e) => handleUpdateLocal(index, 'address', e.target.value)}
									placeholder="Ej: Av. Principal 123, Local 1"
									className="local-settings-item-input"
								/>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Add Local Button */}
			<button
				onClick={handleAddLocal}
				className="local-settings-add"
			>
				<Plus />
				Agregar Nuevo Local
			</button>

			{/* Actions */}
			<div className="local-settings-actions">
				<button
					onClick={onClose}
					className="local-settings-button local-settings-button-cancel"
				>
					Cancelar
				</button>
				<button
					onClick={handleSave}
					className="local-settings-button local-settings-button-save"
				>
					Guardar Cambios
				</button>
			</div>
		</div>
	);
}

