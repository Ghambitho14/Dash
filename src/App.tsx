import { useState, useEffect } from 'react';
import { CompanyPanel } from './components/CompanyPanel';
import { Login } from './components/Login';
import { CompanyLayout } from './layouts/CompanyLayout';
import { User } from './types/user';
import { Order } from './types/order';
import { Client } from './types/client';
import { mockOrders } from './utils/mockData';
import { defaultLocalConfigs, LocalConfig } from './utils/localConfig';

export default function App() {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [localConfigs, setLocalConfigs] = useState<LocalConfig[]>(defaultLocalConfigs);
	const [clients, setClients] = useState<Client[]>([]);

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
	}, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Si no hay usuario logueado, mostrar login
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
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
      />
    </CompanyLayout>
  );
}
