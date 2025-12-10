import { Local } from '../types/order';

export interface LocalConfig {
	name: Local;
	address: string;
}

// Configuración inicial de locales (vacía, se crean dinámicamente)
export const defaultLocalConfigs: LocalConfig[] = [];

// Función helper para obtener la dirección de un local
export function getLocalAddress(localName: string, localConfigs: LocalConfig[]): string {
	const local = localConfigs.find(l => l.name === localName);
	return local?.address || '';
}

