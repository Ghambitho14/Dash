import { CompanyPanel } from './components/CompanyPanel';
import { Login } from './components/Login';
import { CompanyLayout } from './components/CompanyLayout';
import { useAuth } from './hooks/useAuth';
import { useOrders } from './hooks/useOrders';
import { useClients } from './hooks/useClients';
import { useUsers } from './hooks/useUsers';
import { useLocals } from './hooks/useLocals';

export default function App() {
	const { currentUser, login, logout } = useAuth();
	const { localConfigs, setLocalConfigs } = useLocals(currentUser);
	const { clients, createClient, updateClient, deleteClient } = useClients(currentUser, localConfigs);
	const { users, createUser, updateUser, deleteUser } = useUsers(currentUser, localConfigs);
	const { orders, setOrders, createOrder, deleteOrder, reloadOrders } = useOrders(currentUser);

	// Wrappers para manejar errores y confirmaciones
	const handleCreateClient = async (clientData) => {
		try {
			await createClient(clientData);
		} catch (err) {
			alert('Error al crear cliente: ' + err.message);
		}
	};

	const handleUpdateClient = async (clientId, clientData) => {
		try {
			await updateClient(clientId, clientData);
		} catch (err) {
			alert('Error al actualizar cliente: ' + err.message);
		}
	};

	const handleDeleteClient = async (clientId) => {
		if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
			return;
		}
		try {
			await deleteClient(clientId);
		} catch (err) {
			alert('Error al eliminar cliente: ' + err.message);
		}
	};

	const handleCreateUser = async (userData) => {
		try {
			await createUser(userData);
		} catch (err) {
			alert('Error al crear usuario: ' + err.message);
		}
	};

	const handleUpdateUser = async (userId, userData) => {
		try {
			await updateUser(userId, userData);
		} catch (err) {
			alert('Error al actualizar usuario: ' + err.message);
		}
	};

	const handleDeleteUser = async (userId) => {
		if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
			return;
		}
		try {
			await deleteUser(userId);
		} catch (err) {
			alert('Error al eliminar usuario: ' + err.message);
		}
	};

	// Si no hay usuario logueado, mostrar login
	if (!currentUser) {
		return <Login onLogin={login} users={users} />;
	}

	// Solo vista de empresa
	return (
		<CompanyLayout currentUser={currentUser} onLogout={logout}>
			<CompanyPanel 
				currentUser={currentUser} 
				orders={orders} 
				setOrders={setOrders}
				onReloadOrders={reloadOrders}
				localConfigs={localConfigs}
				setLocalConfigs={setLocalConfigs}
				clients={clients}
				onCreateClient={handleCreateClient}
				onUpdateClient={handleUpdateClient}
				onDeleteClient={handleDeleteClient}
				users={users}
				onCreateUser={handleCreateUser}
				onUpdateUser={handleUpdateUser}
				onDeleteUser={handleDeleteUser}
			/>
		</CompanyLayout>
	);
}

