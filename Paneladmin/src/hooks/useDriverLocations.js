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
	const loadLocations = useCallback(async (showLoading = false) => {
		try {
			if (showLoading) {
				setLoading(true);
			}
			setError(null);
			const data = await getAllDriverLocations();
			setLocations(data || []);
			console.log(`📍 Ubicaciones cargadas: ${(data || []).length} repartidores`);
		} catch (err) {
			console.error('Error cargando ubicaciones:', err);
			setError(err.message || 'Error al cargar ubicaciones');
			setLocations([]); // Limpiar ubicaciones en caso de error
		} finally {
			if (showLoading) {
				setLoading(false);
			}
		}
	}, []);

	// Suscribirse a cambios en tiempo real y cargar ubicaciones
	useEffect(() => {
		let mounted = true;
		
		// Cargar ubicaciones iniciales (con loading)
		loadLocations(true);

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
					
					// Solo recargar si el componente sigue montado (sin mostrar loading)
					if (mounted) {
						loadLocations(false);
					}
				}
			)
			.subscribe((status) => {
				console.log('📍 Estado de suscripción de ubicaciones:', status);
				if (status === 'SUBSCRIBED') {
					console.log('✅ Suscrito correctamente a cambios de ubicación');
				} else if (status === 'CHANNEL_ERROR') {
					console.error('❌ Error en suscripción de ubicaciones');
					setError('Error en suscripción en tiempo real');
				}
			});

		// Fallback: recargar cada 15 segundos por si falla realtime (sin mostrar loading)
		const fallbackInterval = setInterval(() => {
			if (mounted) {
				loadLocations(false);
			}
		}, 15000);

		return () => {
			mounted = false;
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

