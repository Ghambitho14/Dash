import { useState, useEffect } from 'react';
import { CompanyPanel } from './components/CompanyPanel';
import { Login } from './components/Login';
import { CompanyLayout } from './layouts/CompanyLayout';
import { User, mockUsers } from './types/user';
import { Order } from './types/order';
import { Client } from './types/client';
import { mockOrders } from './utils/mockData';
import { defaultLocalConfigs, LocalConfig } from './utils/localConfig';

export default function App() {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [localConfigs, setLocalConfigs] = useState<LocalConfig[]>(defaultLocalConfigs);
	const [clients, setClients] = useState<Client[]>([]);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		// Cargar pedidos mock al iniciar
		setOrders(mockOrders);
		// Cargar configuración de locales desde localStorage si existe
		const savedConfigs = localStorage.getItem('localConfigs');
		if (savedConfigs) {
			try {
				setLocalConfigs(JSON.parse(savedConfigs));
			} catch (e) {
				console.error('Error loading local configs:', e);
			}
		}
		// Cargar clientes desde localStorage si existe
		const savedClients = localStorage.getItem('clients');
		if (savedClients) {
			try {
				const parsedClients = JSON.parse(savedClients);
				// Convertir las fechas de string a Date
				const clientsWithDates = parsedClients.map((client: any) => ({
					...client,
					createdAt: new Date(client.createdAt),
					updatedAt: new Date(client.updatedAt),
				}));
				setClients(clientsWithDates);
			} catch (e) {
				console.error('Error loading clients:', e);
			}
		}
		// Cargar usuarios desde localStorage si existe, si no usar mockUsers
		const savedUsers = localStorage.getItem('users');
		if (savedUsers) {
			try {
				const parsedUsers = JSON.parse(savedUsers);
				// Verificar si existe un usuario CEO, si no, agregarlo
				const hasCEO = parsedUsers.some((u: User) => u.role === 'empresarial');
				if (!hasCEO) {
					// Buscar el CEO en mockUsers y agregarlo
					const ceoUser = mockUsers.find(u => u.role === 'empresarial');
					if (ceoUser) {
						parsedUsers.unshift(ceoUser); // Agregar al inicio
						localStorage.setItem('users', JSON.stringify(parsedUsers));
					}
				}
				setUsers(parsedUsers);
			} catch (e) {
				console.error('Error loading users:', e);
				// Si hay error, usar mockUsers como fallback
				setUsers(mockUsers);
			}
		} else {
			// Si no hay usuarios guardados, usar mockUsers iniciales
			setUsers(mockUsers);
			localStorage.setItem('users', JSON.stringify(mockUsers));
		}
	}, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Si no hay usuario logueado, mostrar login
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={users} />;
  }

  const handleCreateClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `CLI-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    // Guardar en localStorage
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleUpdateClient = (clientId: string, clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updatedClients = clients.map(client =>
      client.id === clientId
        ? { ...client, ...clientData, updatedAt: new Date() }
        : client
    );
    setClients(updatedClients);
    // Guardar en localStorage
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    // Guardar en localStorage
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `USR-${Date.now()}`,
    };
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    // Guardar en localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleUpdateUser = (userId: string, userData: Omit<User, 'id'>) => {
    // Prevenir que admin actualice CEO
    if (currentUser && currentUser.role === 'admin') {
      const userToUpdate = users.find(user => user.id === userId);
      if (userToUpdate && userToUpdate.role === 'empresarial') {
        alert('No puedes editar el usuario CEO. Solo el CEO puede modificar su propia cuenta.');
        return;
      }
    }
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, ...userData }
        : user
    );
    setUsers(updatedUsers);
    // Guardar en localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    if (userToDelete && userToDelete.role === 'empresarial') {
      alert('No se puede eliminar el usuario CEO. Este usuario es esencial para el sistema.');
      return;
    }
    let updatedUsers = users.filter(user => user.id !== userId);
    // Asegurarse de que el CEO siempre esté presente
    const hasCEO = updatedUsers.some(u => u.role === 'empresarial');
    if (!hasCEO) {
      const ceoUser = mockUsers.find(u => u.role === 'empresarial');
      if (ceoUser) {
        updatedUsers = [ceoUser, ...updatedUsers];
      }
    }
    setUsers(updatedUsers);
    // Guardar en localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Solo vista de empresa
  return (
    <CompanyLayout currentUser={currentUser} onLogout={handleLogout}>
      <CompanyPanel 
        currentUser={currentUser} 
        orders={orders} 
        setOrders={setOrders}
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
