import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Obtiene la ubicación actual de un repartidor
 */
export async function getDriverLocation(driverId) {
	try {
		const { data, error } = await supabase
			.from('driver_locations')
			.select('*')
			.eq('driver_id', driverId)
			.single();

		if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
		return data;
	} catch (err) {
		logger.error('Error obteniendo ubicación:', err);
		return null;
	}
}

/**
 * Obtiene la ubicación del repartidor asignado a un pedido
 */
export async function getOrderDriverLocation(orderId) {
	try {
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.select('driver_id')
			.eq('id', orderId)
			.single();

		if (orderError) throw orderError;

		if (!order || !order.driver_id) return null;

		return await getDriverLocation(order.driver_id);
	} catch (err) {
		logger.error('Error obteniendo ubicación del repartidor del pedido:', err);
		return null;
	}
}

/**
 * Suscribe a cambios en tiempo real de la ubicación de un repartidor
 */
export function subscribeToDriverLocation(driverId, callback) {
	const channel = supabase
		.channel(`driver_location:${driverId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'driver_locations',
				filter: `driver_id=eq.${driverId}`,
			},
			(payload) => {
				callback(payload.new);
			}
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}

