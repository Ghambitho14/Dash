import { useState, useEffect, useCallback } from 'react';
import { loadClients, createClient, updateClient, deleteClient } from '../services/clientService';

/**
 * Hook para gestionar clientes
 */
export function useClients(currentUser, localConfigs) {
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchClients = useCallback(async () => {
		if (!currentUser) return;

		setLoading(true);
		try {
			const companyId = currentUser.companyId || currentUser.company_id;
			const loadedClients = await loadClients(companyId);
			setClients(loadedClients);
		} catch (err) {
			console.error('Error cargando clientes:', err);
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	useEffect(() => {
		if (currentUser) {
			fetchClients();
		}
	}, [currentUser, fetchClients]);

	const handleCreateClient = useCallback(async (clientData) => {
		if (!currentUser) return;

		try {
			const local = localConfigs.find(l => l.name === clientData.local);
			if (!local) {
				throw new Error('Local no encontrado');
			}

			const newClient = await createClient(clientData, currentUser.companyId, local.id);
			setClients(prev => [newClient, ...prev]);
			return newClient;
		} catch (err) {
			console.error('Error creando cliente:', err);
			throw err;
		}
	}, [currentUser, localConfigs]);

	const handleUpdateClient = useCallback(async (clientId, clientData) => {
		if (!currentUser) return;

		try {
			const client = clients.find(c => c.id === clientId);
			if (!client) return;

			const local = localConfigs.find(l => l.name === clientData.local);
			if (!local) {
				throw new Error('Local no encontrado');
			}

			await updateClient(client._dbId || client.id, clientData, local.id);
			await fetchClients(); // Recargar todos los clientes
			return true;
		} catch (err) {
			console.error('Error actualizando cliente:', err);
			throw err;
		}
	}, [currentUser, clients, localConfigs, fetchClients]);

	const handleDeleteClient = useCallback(async (clientId) => {
		if (!currentUser) return;

		try {
			const client = clients.find(c => c.id === clientId);
			if (!client) return;

			await deleteClient(client._dbId || client.id);
			setClients(prev => prev.filter(c => c.id !== clientId));
			return true;
		} catch (err) {
			console.error('Error eliminando cliente:', err);
			throw err;
		}
	}, [currentUser, clients]);

	return {
		clients,
		setClients,
		loading,
		createClient: handleCreateClient,
		updateClient: handleUpdateClient,
		deleteClient: handleDeleteClient,
		reloadClients: fetchClients,
	};
}

