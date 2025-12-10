import { Local } from '../types/order';

export interface LocalConfig {
	name: Local | string;
	address: string;
}

// Configuración inicial de locales
export const defaultLocalConfigs: LocalConfig[] = [
	{ name: 'Local 1', address: 'Av. Principal 123, Local 1' },
	{ name: 'Local 2', address: 'Av. Comercio 789, Local 2' },
	{ name: 'Local 3', address: 'Av. Central 555, Local 3' },
	{ name: 'Local 4', address: 'Av. Los Pinos 999, Local 4' },
	{ name: 'Local 5', address: 'Av. Las Flores 888, Local 5' },
];

// Función helper para obtener la dirección de un local
export function getLocalAddress(localName: string, localConfigs: LocalConfig[]): string {
	const local = localConfigs.find(l => l.name === localName);
	return local?.address || '';
}

