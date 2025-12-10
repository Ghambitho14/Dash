export interface Driver {
	id: string;
	username: string;
	password: string;
	name: string;
	phone: string;
	email?: string;
	active: boolean;
}

export const mockDrivers: Driver[] = [
	{
		id: 'driver-1',
		username: 'repartidor1',
		password: 'repartidor1',
		name: 'Juan Pérez',
		phone: '+56912345678',
		email: 'juan.perez@example.com',
		active: true,
	},
	{
		id: 'driver-2',
		username: 'repartidor2',
		password: 'repartidor2',
		name: 'María González',
		phone: '+56987654321',
		email: 'maria.gonzalez@example.com',
		active: true,
	},
	{
		id: 'driver-3',
		username: 'repartidor3',
		password: 'repartidor3',
		name: 'Carlos Rodríguez',
		phone: '+56911223344',
		email: 'carlos.rodriguez@example.com',
		active: true,
	},
];

