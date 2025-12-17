/* ====================================
   MOCK DATA - DELIVERY APP
   ==================================== */

import { Order } from './types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    clientName: 'María García',
    clientPhone: '+34 666 123 456',
    pickupAddress: 'Calle Mayor 15, Madrid',
    deliveryAddress: 'Av. Constitución 45, Madrid',
    status: 'pending',
    price: 25.50,
    createdAt: '10:30 AM',
    local: 'Local 1'
  },
  {
    id: 'ORD-002',
    clientName: 'Carlos López',
    clientPhone: '+34 677 234 567',
    pickupAddress: 'Plaza España 8, Barcelona',
    deliveryAddress: 'Ronda Norte 23, Barcelona',
    status: 'in-progress',
    price: 42.00,
    createdAt: '11:15 AM',
    local: 'Local 2'
  },
  {
    id: 'ORD-003',
    clientName: 'Ana Martínez',
    clientPhone: '+34 688 345 678',
    pickupAddress: 'Gran Vía 102, Valencia',
    deliveryAddress: 'Calle Paz 67, Valencia',
    status: 'completed',
    price: 18.75,
    createdAt: '09:45 AM',
    local: 'Local 1'
  },
  {
    id: 'ORD-004',
    clientName: 'Pedro Sánchez',
    clientPhone: '+34 699 456 789',
    pickupAddress: 'Av. Andalucía 34, Sevilla',
    deliveryAddress: 'Calle Luna 12, Sevilla',
    status: 'in-progress',
    price: 31.20,
    createdAt: '10:00 AM',
    local: 'Local 3'
  },
  {
    id: 'ORD-005',
    clientName: 'Laura Fernández',
    clientPhone: '+34 611 567 890',
    pickupAddress: 'Plaza Mayor 5, Zaragoza',
    deliveryAddress: 'Calle Sol 89, Zaragoza',
    status: 'pending',
    price: 28.90,
    createdAt: '11:30 AM',
    local: 'Local 2'
  },
  {
    id: 'ORD-006',
    clientName: 'Miguel Ruiz',
    clientPhone: '+34 622 678 901',
    pickupAddress: 'Ronda Sur 45, Málaga',
    deliveryAddress: 'Av. Mar 156, Málaga',
    status: 'completed',
    price: 35.60,
    createdAt: '08:30 AM',
    local: 'Local 4'
  }
];
