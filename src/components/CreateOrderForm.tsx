import { useState, useEffect, useMemo } from 'react';
import { Order, Local } from '../types/order';
import { User } from '../types/user';
import { Client } from '../types/client';
import { LocalConfig, getLocalAddress } from '../utils/localConfig';
import { X, MapPin, Navigation, DollarSign, FileText, Store, User as UserIcon } from 'lucide-react';
import './CreateOrderForm.css';

interface CreateOrderFormProps {
	onSubmit: (orderData: Omit<Order, 'id' | 'companyId' | 'companyName' | 'status' | 'pickupCode' | 'createdAt' | 'updatedAt'>) => void;
	onCancel: () => void;
	currentUser: User;
	localConfigs: LocalConfig[];
	clients: Client[];
}

export function CreateOrderForm({ onSubmit, onCancel, currentUser, localConfigs, clients }: CreateOrderFormProps) {
	const isLocal = currentUser.role === 'local' && currentUser.local;
	const availableLocales = isLocal 
		? [currentUser.local!]
		: localConfigs.map(config => config.name as Local);
	
	const initialLocal = (isLocal ? currentUser.local! : localConfigs[0]?.name || 'Local 1') as Local;
	const initialAddress = getLocalAddress(initialLocal, localConfigs);

	const [formData, setFormData] = useState({
		clientName: '',
		selectedClientId: '',
		pickupAddress: initialAddress,
		deliveryAddress: '',
		local: initialLocal,
		suggestedPrice: '',
		notes: '',
	});

	const [showClientDropdown, setShowClientDropdown] = useState(false);

	// Filtrar clientes según búsqueda y local seleccionado
	const filteredClients = useMemo(() => {
		// Primero filtrar por local
		let localFilteredClients = clients.filter(client => client.local === formData.local);
		
		// Luego filtrar por búsqueda
		if (!formData.clientName.trim()) return localFilteredClients;
		const search = formData.clientName.toLowerCase();
		return localFilteredClients.filter(client => 
			client.name.toLowerCase().includes(search) ||
			client.phone.includes(search) ||
			client.address.toLowerCase().includes(search)
		);
	}, [clients, formData.clientName, formData.local]);

	// Cuando se selecciona un cliente, autocompletar dirección
	const handleSelectClient = (client: Client) => {
		setFormData(prev => ({
			...prev,
			selectedClientId: client.id,
			clientName: client.name,
			deliveryAddress: client.address,
		}));
		setShowClientDropdown(false);
	};

	// Cuando se escribe manualmente, limpiar selección
	const handleClientNameChange = (value: string) => {
		setFormData(prev => ({
			...prev,
			clientName: value,
			selectedClientId: '',
			// Si se borra el nombre, limpiar también la dirección si fue autocompletada
			deliveryAddress: prev.selectedClientId ? '' : prev.deliveryAddress,
		}));
		setShowClientDropdown(value.trim().length > 0);
	};

	// Cerrar dropdown al hacer click fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.create-order-form-client-wrapper')) {
				setShowClientDropdown(false);
			}
		};

		if (showClientDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [showClientDropdown]);

	useEffect(() => {
		if (isLocal) {
			setFormData(prev => ({ 
				...prev, 
				local: currentUser.local!,
				pickupAddress: getLocalAddress(currentUser.local!, localConfigs)
			}));
		}
	}, [isLocal, currentUser.local, localConfigs]);

	const handleLocalChange = (local: Local | string) => {
		setFormData(prev => ({ 
			...prev, 
			local: local as Local,
			pickupAddress: getLocalAddress(local, localConfigs)
		}));
	};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      pickupAddress: formData.pickupAddress,
      deliveryAddress: formData.deliveryAddress,
      local: formData.local,
      suggestedPrice: parseFloat(formData.suggestedPrice),
      notes: formData.notes || undefined,
    });
  };

  const isValid = formData.pickupAddress.trim() !== '' 
    && formData.deliveryAddress.trim() !== '' 
    && formData.suggestedPrice !== '' 
    && parseFloat(formData.suggestedPrice) > 0;

  const getGridClass = () => {
    if (availableLocales.length <= 3) return 'create-order-form-local-grid-3';
    if (availableLocales.length <= 4) return 'create-order-form-local-grid-4';
    return 'create-order-form-local-grid-5';
  };

  return (
    <form onSubmit={handleSubmit} className="create-order-form">
      {/* Header */}
      <div className="create-order-form-header">
        <div className="create-order-form-header-content">
          <h3>Crear Nuevo Pedido</h3>
          <p>Completa los detalles del pedido</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="create-order-form-close"
        >
          <X />
        </button>
      </div>

      {/* Form Fields */}
      <div className="create-order-form-fields">
        {/* Client Selection */}
        <div className="create-order-form-group">
          <label className="create-order-form-label">
            <div className="create-order-form-label-content">
              <UserIcon />
              Cliente (Opcional)
            </div>
          </label>
          <div className="create-order-form-client-wrapper">
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleClientNameChange(e.target.value)}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Escribe el nombre o selecciona un cliente"
              className="create-order-form-input"
            />
            {showClientDropdown && filteredClients.length > 0 && (
              <div className="create-order-form-client-dropdown">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className="create-order-form-client-item"
                  >
                    <div className="create-order-form-client-item-info">
                      <p className="create-order-form-client-item-name">{client.name}</p>
                      <p className="create-order-form-client-item-details">
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
        <div className="create-order-form-group">
          <label className="create-order-form-label">
            <div className="create-order-form-label-content">
              <MapPin />
              Dirección de Retiro *
            </div>
          </label>
          <input
            type="text"
            value={formData.pickupAddress}
            onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
            placeholder="Ej: Av. Principal 123, Local 5"
            className="create-order-form-input"
            required
          />
        </div>

        {/* Delivery Address */}
        <div className="create-order-form-group">
          <label className="create-order-form-label">
            <div className="create-order-form-label-content">
              <Navigation />
              Dirección de Entrega *
              {formData.selectedClientId && (
                <span className="create-order-form-client-badge">Desde cliente</span>
              )}
            </div>
          </label>
          <input
            type="text"
            value={formData.deliveryAddress}
            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
            placeholder="Ej: Calle Secundaria 456, Apto 10B"
            className="create-order-form-input"
            required
          />
        </div>

        {/* Local */}
        <div className="create-order-form-group">
          <label className="create-order-form-label">
            <div className="create-order-form-label-content">
              <Store />
              Local de Retiro *
            </div>
          </label>
          {isLocal ? (
            <div className="create-order-form-local-display">
              {currentUser.local}
            </div>
          ) : (
            <div className={`create-order-form-local-grid ${getGridClass()}`}>
              {availableLocales.map((local) => (
                <button
                  key={local}
                  type="button"
                  onClick={() => handleLocalChange(local)}
                  className={`create-order-form-local-button ${formData.local === local ? 'create-order-form-local-button-active' : 'create-order-form-local-button-inactive'}`}
                >
                  {local}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Price */}
        <div className="create-order-form-group">
          <label className="create-order-form-label">
            <div className="create-order-form-label-content">
              <DollarSign />
              Precio Sugerido para el Repartidor *
            </div>
          </label>
          <div className="create-order-form-price-wrapper">
            <span className="create-order-form-price-symbol">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.suggestedPrice}
              onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
              placeholder="0.00"
              className="create-order-form-input create-order-form-price-input"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="create-order-form-group">
          <label className="create-order-form-label">
            <div className="create-order-form-label-content">
              <FileText />
              Notas Adicionales (Opcional)
            </div>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Instrucciones especiales, detalles del paquete, etc."
            rows={3}
            className="create-order-form-textarea"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="create-order-form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="create-order-form-button create-order-form-button-cancel"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="create-order-form-button create-order-form-button-submit"
        >
          Crear Pedido
        </button>
      </div>
    </form>
  );
}
