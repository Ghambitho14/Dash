import { Order } from '../types/order';
import { OrderCard as DriverOrderCard } from './driver/OrderCard';
import './OrderList.css';

interface OrderListProps {
	orders: Order[];
	onSelectOrder: (order: Order) => void;
	onDeleteOrder?: (orderId: string) => void;
}

export function OrderList({ orders, onSelectOrder, onDeleteOrder }: OrderListProps) {
	if (orders.length === 0) {
		return (
			<div className="order-list-empty">
				<p className="order-list-empty-text">No hay pedidos para mostrar</p>
			</div>
		);
	}

	return (
		<div className="order-list">
			{orders.map((order) => (
				<DriverOrderCard
					key={order.id}
					order={order}
					onClick={() => onSelectOrder(order)}
					onDelete={onDeleteOrder}
				/>
			))}
		</div>
	);
}
