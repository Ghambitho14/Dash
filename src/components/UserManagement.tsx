import { useState } from 'react';
import { User } from '../types/user';
import { CreateUserForm } from './CreateUserForm';
import { X, User as UserIcon, Plus, Edit2, Trash2, Shield, Store, Crown } from 'lucide-react';
import { getRoleName } from '../utils/roleUtils';
import '../styles/Components/UserManagement.css';

interface UserManagementProps {
	users: User[];
	onCreateUser: (userData: Omit<User, 'id'>) => void;
	onUpdateUser: (userId: string, userData: Omit<User, 'id'>) => void;
	onDeleteUser: (userId: string) => void;
	onClose: () => void;
	localConfigs: { name: string; address: string }[];
	currentUser: User;
}

export function UserManagement({ users, onCreateUser, onUpdateUser, onDeleteUser, onClose, localConfigs, currentUser }: UserManagementProps) {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	const handleEdit = (user: User) => {
		// Prevenir que admin edite CEO
		if (currentUser.role === 'admin' && user.role === 'empresarial') {
			alert('No puedes editar el usuario CEO. Solo el CEO puede modificar su propia cuenta.');
			return;
		}
		setEditingUser(user);
		setShowCreateForm(true);
	};

	const handleDelete = (userId: string, userRole: string) => {
		if (userRole === 'empresarial') {
			alert('No se puede eliminar el usuario CEO. Este usuario es esencial para el sistema.');
			return;
		}
		if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
			onDeleteUser(userId);
		}
	};

	const handleCreateSubmit = (userData: Omit<User, 'id'>) => {
		if (editingUser) {
			onUpdateUser(editingUser.id, userData);
			setEditingUser(null);
		} else {
			onCreateUser(userData);
		}
		setShowCreateForm(false);
	};

	const handleCreateFormClose = () => {
		setShowCreateForm(false);
		setEditingUser(null);
	};

	return (
		<>
			<div className={`user-management-overlay ${showCreateForm ? 'user-management-overlay-hidden' : ''}`} onClick={onClose}>
				<div className="user-management-content" onClick={(e) => e.stopPropagation()}>
					<div className="user-management-header">
						<div className="user-management-header-content">
							<div className="user-management-header-icon">
								<UserIcon />
							</div>
							<div>
								<h2 className="user-management-title">Gestionar Usuarios</h2>
								<p className="user-management-subtitle">Crea y administra usuarios del sistema</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="user-management-close"
							aria-label="Cerrar"
						>
							<X />
						</button>
					</div>

					<div className="user-management-actions">
						<button
							onClick={() => {
								setEditingUser(null);
								setShowCreateForm(true);
							}}
							className="user-management-button user-management-button-primary"
						>
							<Plus />
							Agregar Nuevo Usuario
						</button>
					</div>

					<div className="user-management-list">
						{users.length === 0 ? (
							<div className="user-management-empty">
								<UserIcon className="user-management-empty-icon" />
								<p className="user-management-empty-title">No hay usuarios registrados</p>
								<p className="user-management-empty-text">
									Haz clic en "Agregar Nuevo Usuario" para empezar.
								</p>
							</div>
						) : (
							users.map((user) => (
								<div key={user.id} className="user-management-item">
									<div className="user-management-item-info">
										<div className="user-management-item-icon">
											{user.role === 'empresarial' ? <Crown /> : user.role === 'admin' ? <Shield /> : <Store />}
										</div>
										<div className="user-management-item-details">
											<p className="user-management-item-name">{user.name}</p>
											<p className="user-management-item-username">@{user.username}</p>
											<div className="user-management-item-badges">
												<span className={`user-management-item-badge user-management-item-badge-${user.role}`}>
													{getRoleName(user.role)}
												</span>
												{user.local && (
													<span className="user-management-item-badge user-management-item-badge-local">
														<Store size={12} />
														{user.local}
													</span>
												)}
											</div>
										</div>
									</div>
									<div className="user-management-item-actions">
										{!(currentUser.role === 'admin' && user.role === 'empresarial') && (
											<button
												onClick={() => handleEdit(user)}
												className="user-management-item-button user-management-item-button-edit"
												title="Editar usuario"
											>
												<Edit2 size={16} />
											</button>
										)}
										{user.role !== 'empresarial' && (
											<button
												onClick={() => handleDelete(user.id, user.role)}
												className="user-management-item-button user-management-item-button-delete"
												title="Eliminar usuario"
											>
												<Trash2 size={16} />
											</button>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{showCreateForm && (
				<CreateUserForm
					onSubmit={handleCreateSubmit}
					onClose={handleCreateFormClose}
					localConfigs={localConfigs}
					existingUsers={users}
					initialData={editingUser ? {
						id: editingUser.id,
						username: editingUser.username,
						password: editingUser.password,
						name: editingUser.name,
						role: editingUser.role,
						local: editingUser.local,
					} : undefined}
				/>
			)}
		</>
	);
}

