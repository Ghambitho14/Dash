/* ====================================
   UTILITY FUNCTIONS - DELIVERY APP
   ==================================== */

import { Order } from './types';

export const getStatusText = (status: Order['status']): string => {
  const statusMap = {
    'pending': 'Pendiente',
    'in-progress': 'En Progreso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  };
  return statusMap[status];
};

export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getRoleText = (role: 'admin' | 'empresarial' | 'local'): string => {
  const roleMap = {
    'admin': 'Administrador',
    'empresarial': 'CEO',
    'local': 'Local'
  };
  return roleMap[role];
};
