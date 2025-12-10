import { Local } from './order';

export interface Client {
	id: string;
	name: string;
	phone: string;
	address: string;
	local: Local;
	createdAt: Date;
	updatedAt: Date;
}

