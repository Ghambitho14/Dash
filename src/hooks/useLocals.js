import { useState, useEffect, useCallback } from 'react';
import { loadLocals, saveLocalConfigs } from '../services/localService';

/**
 * Hook para gestionar locales
 */
export function useLocals(currentUser) {
	const [localConfigs, setLocalConfigs] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchLocals = useCallback(async () => {
		if (!currentUser) return;

		setLoading(true);
		try {
			const companyId = currentUser.companyId || currentUser.company_id;
			const loadedLocals = await loadLocals(companyId);
			setLocalConfigs(loadedLocals);
		} catch (err) {
			console.error('Error cargando locales:', err);
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	useEffect(() => {
		if (currentUser) {
			fetchLocals();
		}
	}, [currentUser, fetchLocals]);

	const handleSaveLocalConfigs = useCallback(async (configs) => {
		if (!currentUser) return;

		try {
			const companyId = currentUser.companyId || currentUser.company_id;
			const updatedLocals = await saveLocalConfigs(configs, companyId);
			setLocalConfigs(updatedLocals);
			return updatedLocals;
		} catch (err) {
			console.error('Error guardando locales:', err);
			throw err;
		}
	}, [currentUser]);

	return {
		localConfigs,
		setLocalConfigs,
		loading,
		saveLocalConfigs: handleSaveLocalConfigs,
		reloadLocals: fetchLocals,
	};
}

