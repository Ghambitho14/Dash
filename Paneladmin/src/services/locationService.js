import { supabase } from '../utils/supabase';

/**
 * Obtiene todas las ubicaciones de repartidores activos
 */
export async function getAllDriverLocations() {
	try {
		const { data, error } = await supabase
			.from('driver_locations')
			.select(`
				*,
				drivers (
					id,
					name,
					username,
					phone,
					active,
					company_id,
					companies (
						id,
						name
					)
				)
			`)
			.order('updated_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error obteniendo ubicaciones de repartidores:', err);
		throw err;
	}
}

/**
 * Obtiene la ubicación de un repartidor específico
 */
export async function getDriverLocation(driverId) {
	try {
		const { data, error } = await supabase
			.from('driver_locations')
			.select(`
				*,
				drivers (
					id,
					name,
					username,
					phone,
					active,
					company_id,
					companies (
						id,
						name
					)
				)
			`)
			.eq('driver_id', driverId)
			.single();

		if (error && error.code !== 'PGRST116') throw error;
		return data;
	} catch (err) {
		console.error('Error obteniendo ubicación del repartidor:', err);
		return null;
	}
}

