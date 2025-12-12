import { useState, useEffect, useCallback } from 'react';
import { loadUsers, createUser, updateUser, deleteUser } from '../services/userService';

/**
 * Hook para gestionar usuarios
 */
export function useUsers(currentUser, localConfigs) {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchUsers = useCallback(async () => {
		if (!currentUser) return;

		setLoading(true);
		try {
			const companyId = currentUser.companyId || currentUser.company_id;
			const loadedUsers = await loadUsers(companyId);
			setUsers(loadedUsers);
		} catch (err) {
			console.error('Error cargando usuarios:', err);
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	useEffect(() => {
		if (currentUser) {
			fetchUsers();
		}
	}, [currentUser, fetchUsers]);

	const handleCreateUser = useCallback(async (userData) => {
		if (!currentUser) return;

		try {
			const local = userData.local ? localConfigs.find(l => l.name === userData.local) : null;
			const newUser = await createUser(userData, currentUser.companyId, local?.id || null);
			setUsers(prev => [newUser, ...prev]);
			return newUser;
		} catch (err) {
			console.error('Error creando usuario:', err);
			throw err;
		}
	}, [currentUser, localConfigs]);

	const handleUpdateUser = useCallback(async (userId, userData) => {
		if (!currentUser) return;

		// Los admins no pueden editar al CEO
		if (currentUser.role === 'admin') {
			const userToUpdate = users.find(user => user.id === userId);
			if (userToUpdate && userToUpdate.role === 'empresarial') {
				throw new Error('No puedes editar el usuario CEO. Solo el CEO puede modificar su propia cuenta.');
			}
		}

		try {
			const user = users.find(u => u.id === userId);
			if (!user) return;

			const local = userData.local ? localConfigs.find(l => l.name === userData.local) : null;
			await updateUser(user._dbId || user.id, userData, local?.id || null);
			await fetchUsers(); // Recargar todos los usuarios
			return true;
		} catch (err) {
			console.error('Error actualizando usuario:', err);
			throw err;
		}
	}, [currentUser, users, localConfigs, fetchUsers]);

	const handleDeleteUser = useCallback(async (userId) => {
		if (!currentUser) return;

		// No se puede eliminar al CEO
		const userToDelete = users.find(user => user.id === userId);
		if (userToDelete && userToDelete.role === 'empresarial') {
			throw new Error('No se puede eliminar el usuario CEO. Este usuario es esencial para el sistema.');
		}

		try {
			const user = users.find(u => u.id === userId);
			if (!user) return;

			await deleteUser(user._dbId || user.id);
			setUsers(prev => prev.filter(u => u.id !== userId));
			return true;
		} catch (err) {
			console.error('Error eliminando usuario:', err);
			throw err;
		}
	}, [currentUser, users]);

	return {
		users,
		setUsers,
		loading,
		createUser: handleCreateUser,
		updateUser: handleUpdateUser,
		deleteUser: handleDeleteUser,
		reloadUsers: fetchUsers,
	};
}

