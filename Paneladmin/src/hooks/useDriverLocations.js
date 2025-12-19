import { useState, useEffect, useCallback } from 'react';
import { getAllDriverLocations } from '../services/locationService';
import { supabase } from '../utils/supabase';

/**
 * Hook para trackear ubicaciones de todos los repartidores en tiempo real
 */
export function useDriverLocations() {
	const [locations, setLocations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Cargar ubicaciones iniciales
	const loadLocations = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getAllDriverLocations();
			setLocations(data || []);
		} catch (err) {
			console.error('Error cargando ubicaciones:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	// Cargar ubicaciones al montar
	useEffect(() => {
		loadLocations();
	}, [loadLocations]);

	// Suscribirse a cambios en tiempo real
	useEffect(() => {
		// Cargar ubicaciones iniciales
		loadLocations();

		// Suscribirse a cambios en driver_locations
		const channel = supabase
			.channel('driver_locations_tracking')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'driver_locations',
				},
				(payload) => {
					console.log('📍 Cambio en ubicación detectado:', payload);
					
					// Recargar todas las ubicaciones cuando hay un cambio
					loadLocations();
				}
			)
			.subscribe((status) => {
				console.log('📍 Estado de suscripción de ubicaciones:', status);
			});

		// Fallback: recargar cada 10 segundos por si falla realtime
		const fallbackInterval = setInterval(() => {
			loadLocations();
		}, 10000);

		return () => {
			clearInterval(fallbackInterval);
			supabase.removeChannel(channel);
		};
	}, [loadLocations]);

	return {
		locations,
		loading,
		error,
		reload: loadLocations,
	};
}

