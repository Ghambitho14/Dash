/* ====================================
   TYPES & INTERFACES - DELIVERY APP
   ==================================== */

export interface User {
  name: string;
  role: 'admin' | 'empresarial' | 'local';
  local?: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  createdAt: string;
  local: string;
}

export interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export type TabType = 'all' | 'active' | 'completed';
