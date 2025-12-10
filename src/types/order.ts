export type OrderStatus = 
  | 'Pendiente'
  | 'Asignado'
  | 'En camino al retiro'
  | 'Producto retirado'
  | 'Entregado';

export type Local = string;

export interface Order {
  id: string;
  companyId: string;
  companyName: string;
  pickupAddress: string;
  deliveryAddress: string;
  local: Local;
  suggestedPrice: number;
  notes?: string;
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  pickupCode: string;
  createdAt: Date;
  updatedAt: Date;
}
