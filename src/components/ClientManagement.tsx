import { useState, useMemo } from 'react';
import { Client } from '../types/client';
import { CreateClientForm } from './CreateClientForm';
import type { User } from '../types/user';
import { LocalConfig } from '../utils/localConfig';
import { X, User as UserIcon, Plus, Edit2, Trash2, Phone, MapPin, Store } from 'lucide-react';
import './ClientManagement.css';

interface ClientManagementProps {
	clients: Client[];
	currentUser: User;
	localConfigs: LocalConfig[];
	onCreateClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdateClient: (clientId: string, clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onDeleteClient: (clientId: string) => void;
	onClose: () => void;
}

export function ClientManagement({ clients, currentUser, localConfigs, onCreateClient, onUpdateClient, onDeleteClient, onClose }: ClientManagementProps) {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);

	// Filtrar clientes según el local del usuario
	const filteredClients = useMemo(() => {
		if (currentUser.role === 'local' && currentUser.local) {
			return clients.filter(client => client.local === currentUser.local);
		}
		// Si es admin, mostrar todos los clientes
		return clients;
	}, [clients, currentUser]);

	const handleEdit = (client: Client) => {
		setEditingClient(client);
		setShowCreateForm(true);
	};

	const handleDelete = (clientId: string) => {
		if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
			onDeleteClient(clientId);
		}
	};

	const handleCreateSubmit = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
		if (editingClient) {
			onUpdateClient(editingClient.id, clientData);
			setEditingClient(null);
		} else {
			onCreateClient(clientData);
		}
		setShowCreateForm(false);
	};

	const handleCreateFormClose = () => {
		setShowCreateForm(false);
		setEditingClient(null);
	};

	return (
		<>
			<div className="client-management-overlay" onClick={onClose}>
				<div className="client-management-content" onClick={(e) => e.stopPropagation()}>
					{/* Header */}
					<div className="client-management-header">
						<div className="client-management-header-content">
							<div className="client-management-header-icon">
								<UserIcon />
							</div>
							<div>
								<h2 className="client-management-title">Configurar Clientes</h2>
								<p className="client-management-subtitle">Gestiona tu lista de clientes</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="client-management-close"
							aria-label="Cerrar"
						>
							<X />
						</button>
					</div>

					{/* Actions */}
					<div className="client-management-actions">
						<button
							onClick={() => setShowCreateForm(true)}
							className="client-management-button client-management-button-add"
						>
							<Plus />
							Agregar Cliente
						</button>
					</div>

					{/* Clients List */}
					<div className="client-management-list">
						{filteredClients.length === 0 ? (
							<div className="client-management-empty">
								<UserIcon className="client-management-empty-icon" />
								<p className="client-management-empty-text">No hay clientes registrados</p>
								<p className="client-management-empty-subtext">
									{currentUser.role === 'local' 
										? `No hay clientes asignados a ${currentUser.local}`
										: 'Agrega tu primer cliente para comenzar'}
								</p>
							</div>
						) : (
							filteredClients.map((client) => (
								<div key={client.id} className="client-management-item">
									<div className="client-management-item-content">
									<div className="client-management-item-avatar">
										<UserIcon />
									</div>
									<div className="client-management-item-info">
										<h3 className="client-management-item-name">{client.name}</h3>
										<div className="client-management-item-details">
											<div className="client-management-item-detail">
												<Phone />
												<span>{client.phone}</span>
											</div>
											<div className="client-management-item-detail">
												<MapPin />
												<span>{client.address}</span>
											</div>
											<div className="client-management-item-detail">
												<Store />
												<span>{client.local}</span>
											</div>
										</div>
									</div>
									</div>
									<div className="client-management-item-actions">
										<button
											onClick={() => handleEdit(client)}
											className="client-management-item-button client-management-item-button-edit"
											title="Editar cliente"
										>
											<Edit2 />
										</button>
										<button
											onClick={() => handleDelete(client.id)}
											className="client-management-item-button client-management-item-button-delete"
											title="Eliminar cliente"
										>
											<Trash2 />
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Create/Edit Form */}
			{showCreateForm && (
				<CreateClientForm
					onSubmit={handleCreateSubmit}
					onClose={handleCreateFormClose}
					currentUser={currentUser}
					localConfigs={localConfigs}
					initialData={editingClient ? {
						name: editingClient.name,
						phone: editingClient.phone,
						address: editingClient.address,
						local: editingClient.local,
					} : undefined}
				/>
			)}
		</>
	);
}

