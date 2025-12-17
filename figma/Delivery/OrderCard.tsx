/* ====================================
   ORDER CARD COMPONENT
   ==================================== */

import { MapPin, Clock } from 'lucide-react';
import { Order } from './types';
import { getStatusText, getInitials } from './utils';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="delivery-order-card">
      <div className="delivery-order-header">
        <span className="delivery-order-id">{order.id}</span>
        <span className={`delivery-order-status ${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>
      
      <div className="delivery-order-client">
        <div className="delivery-order-client-avatar">
          {getInitials(order.clientName)}
        </div>
        <div className="delivery-order-client-info">
          <h4>{order.clientName}</h4>
          <p>{order.clientPhone}</p>
        </div>
      </div>
      
      <div className="delivery-order-details">
        <div className="delivery-order-detail-row">
          <MapPin />
          <span>{order.pickupAddress}</span>
        </div>
        <div className="delivery-order-detail-row">
          <MapPin />
          <span>{order.deliveryAddress}</span>
        </div>
      </div>
      
      <div className="delivery-order-footer">
        <div className="delivery-order-time">
          <Clock size={12} />
          {order.createdAt}
        </div>
        <div className="delivery-order-price">
          ${order.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
