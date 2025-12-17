import { X, MapPin, Navigation, DollarSign, FileText, Store, User as UserIcon } from 'lucide-react';
import { useCreateOrderForm } from '../../hooks/useCreateOrderForm';
import '../../styles/Components/CreateOrderForm.css';

export function CreateOrderForm({ onSubmit, onCancel, currentUser, localConfigs, clients }) {
	const {
		formData,
		showClientDropdown,
		filteredClients,
		isLocal,
		availableLocales,
		isValid,
		gridClass,
		setFormData,
		setShowClientDropdown,
		handleSelectClient,
		handleClientNameChange,
		handleLocalChange,
		handleSubmit: handleFormSubmit,
	} = useCreateOrderForm(currentUser, localConfigs, clients);

	const handleSubmit = (e) => {
		const orderData = handleFormSubmit(e);
		if (orderData) {
			onSubmit(orderData);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="formulario-crear-pedido">
			{/* Header */}
			<div className="formulario-crear-pedido-header">
				<div className="formulario-crear-pedido-header-content">
					<h3>Crear Nuevo Pedido</h3>
					<p>Completa los detalles del pedido</p>
				</div>
				<button
					type="button"
					onClick={onCancel}
					className="formulario-crear-pedido-close"
				>
					<X />
				</button>
			</div>

			{/* Form Fields */}
			<div className="formulario-crear-pedido-fields">
				{/* Client Selection */}
				<div className="formulario-crear-pedido-group">
					<label className="formulario-crear-pedido-label">
						<div className="formulario-crear-pedido-label-content">
							<UserIcon />
							Cliente (Opcional)
						</div>
					</label>
					<div className="formulario-crear-pedido-client-wrapper">
						<input
							type="text"
							value={formData.clientName}
							onChange={(e) => handleClientNameChange(e.target.value)}
							onFocus={() => setShowClientDropdown(true)}
							placeholder="Escribe el nombre o selecciona un cliente"
							className="formulario-crear-pedido-input"
						/>
						{showClientDropdown && filteredClients.length > 0 && (
							<div className="formulario-crear-pedido-client-dropdown">
								{filteredClients.map((client) => (
									<button
										key={client.id}
										type="button"
										onClick={() => handleSelectClient(client)}
										className="formulario-crear-pedido-client-item"
									>
										<div className="formulario-crear-pedido-client-item-info">
											<p className="formulario-crear-pedido-client-item-name">{client.name}</p>
											<p className="formulario-crear-pedido-client-item-details">
												{client.phone} • {client.address}
											</p>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Pickup Address */}
				<div className="formulario-crear-pedido-group">
					<label className="formulario-crear-pedido-label">
						<div className="formulario-crear-pedido-label-content">
							<MapPin />
							Dirección de Retiro *
						</div>
					</label>
					<input
						type="text"
						value={formData.pickupAddress}
						onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
						placeholder="Ej: Av. Principal 123, Local 5"
						className="formulario-crear-pedido-input"
						required
					/>
				</div>

				{/* Delivery Address */}
				<div className="formulario-crear-pedido-group">
					<label className="formulario-crear-pedido-label">
						<div className="formulario-crear-pedido-label-content">
							<Navigation />
							Dirección de Entrega *
							{formData.selectedClientId && (
								<span className="formulario-crear-pedido-client-badge">Desde cliente</span>
							)}
						</div>
					</label>
					<input
						type="text"
						value={formData.deliveryAddress}
						onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
						placeholder="Ej: Calle Secundaria 456, Apto 10B"
						className="formulario-crear-pedido-input"
						required
					/>
				</div>

				{/* Local */}
				<div className="formulario-crear-pedido-group">
					<label className="formulario-crear-pedido-label">
						<div className="formulario-crear-pedido-label-content">
							<Store />
							Local de Retiro *
						</div>
					</label>
					{isLocal ? (
						<div className="formulario-crear-pedido-local-display">
							{currentUser.local}
						</div>
					) : (
						<div className={`formulario-crear-pedido-local-grid ${gridClass}`}>
							{availableLocales.map((local) => (
								<button
									key={local}
									type="button"
									onClick={() => handleLocalChange(local)}
									className={`formulario-crear-pedido-local-button ${formData.local === local ? 'formulario-crear-pedido-local-button-active' : 'formulario-crear-pedido-local-button-inactive'}`}
								>
									{local}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Suggested Price */}
				<div className="formulario-crear-pedido-group">
					<label className="formulario-crear-pedido-label">
						<div className="formulario-crear-pedido-label-content">
							<DollarSign />
							Precio Sugerido para el Repartidor *
						</div>
					</label>
					<div className="formulario-crear-pedido-price-wrapper">
						<span className="formulario-crear-pedido-price-symbol">$</span>
						<input
							type="number"
							step="0.01"
							min="0"
							value={formData.suggestedPrice}
							onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
							placeholder="0.00"
							className="formulario-crear-pedido-input formulario-crear-pedido-price-input"
							required
						/>
					</div>
				</div>

				{/* Notes */}
				<div className="formulario-crear-pedido-group">
					<label className="formulario-crear-pedido-label">
						<div className="formulario-crear-pedido-label-content">
							<FileText />
							Notas Adicionales (Opcional)
						</div>
					</label>
					<textarea
						value={formData.notes}
						onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
						placeholder="Instrucciones especiales, detalles del paquete, etc."
						rows={3}
						className="formulario-crear-pedido-textarea"
					/>
				</div>
			</div>

			{/* Actions */}
			<div className="formulario-crear-pedido-actions">
				<button
					type="button"
					onClick={onCancel}
					className="formulario-crear-pedido-button formulario-crear-pedido-button-cancel"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={!isValid}
					className="formulario-crear-pedido-button formulario-crear-pedido-button-submit"
				>
					Crear Pedido
				</button>
			</div>
		</form>
	);
}

