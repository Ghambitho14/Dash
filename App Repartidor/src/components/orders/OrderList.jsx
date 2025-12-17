import { OrderCard } from './OrderCard';
import '../../styles/Components/OrderList.css';

export function OrderList({ orders, onSelectOrder, onDeleteOrder }) {
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
				<OrderCard
					key={order.id}
					order={order}
					onClick={() => onSelectOrder(order)}
					onDelete={onDeleteOrder}
				/>
			))}
		</div>
	);
}

