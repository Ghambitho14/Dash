import { useState, useEffect } from 'react';
import { getCurrentLocation } from '../utils/utils';
import { logger } from '../utils/logger';

/**
 * Hook para obtener y mantener la ubicación GPS del repartidor
 */
export function useDriverLocation(enabled = true) {
	const [location, setLocation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!enabled) return;

		setLoading(true);
		getCurrentLocation()
			.then((loc) => {
				if (loc) {
					setLocation(loc);
					setError(null);
				} else {
					setError('No se pudo obtener la ubicación');
				}
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});

		// Actualizar ubicación cada 30 segundos
		const interval = setInterval(() => {
			getCurrentLocation()
				.then((loc) => {
					if (loc) {
						setLocation(loc);
					}
				})
				.catch((err) => {
					logger.error('Error actualizando ubicación:', err);
				});
		}, 30000);

		return () => clearInterval(interval);
	}, [enabled]);

	return { location, loading, error };
}

