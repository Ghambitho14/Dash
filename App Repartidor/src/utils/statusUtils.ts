import { OrderStatus } from '../types/order';
import { Clock, CheckCircle, Truck, Package, CheckCircle2 } from 'lucide-react';
import './statusUtils.css';

export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'Pendiente':
      return 'status-pendiente';
    case 'Asignado':
      return 'status-asignado';
    case 'En camino al retiro':
      return 'status-en-camino-al-retiro';
    case 'Producto retirado':
      return 'status-producto-retirado';
    case 'Entregado':
      return 'status-entregado';
    default:
      return 'status-default';
  }
}

export function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case 'Pendiente':
      return Clock;
    case 'Asignado':
      return CheckCircle;
    case 'En camino al retiro':
      return Truck;
    case 'Producto retirado':
      return Package;
    case 'Entregado':
      return CheckCircle2;
    default:
      return Clock;
  }
}

export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  switch (currentStatus) {
    case 'Asignado':
      return 'En camino al retiro';
    case 'En camino al retiro':
      return 'Producto retirado';
    case 'Producto retirado':
      return 'Entregado';
    default:
      return null;
  }
}

/**
 * Formatea el estado del pedido para mostrarlo en la vista de la empresa
 * Cuando el estado es "Producto retirado", se muestra como "Producto retirado, en camino"
 */
export function formatStatusForCompany(status: OrderStatus): string {
  if (status === 'Producto retirado') {
    return 'Producto retirado, en camino';
  }
  return status;
}
