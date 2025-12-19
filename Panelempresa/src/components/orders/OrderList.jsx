import { OrderCard as CompanyOrderCard } from './OrderCard';

export function OrderList({ orders, onSelectOrder, onDeleteOrder }) {
	if (orders.length === 0) {
		return (
			<div className="delivery-empty-state">
				<p>No hay pedidos para mostrar</p>
			</div>
		);
	}

	return (
		<>
			{orders.map((order) => (
				<CompanyOrderCard
					key={order.id}
					order={order}
					onClick={() => onSelectOrder(order)}
					onDelete={onDeleteOrder}
				/>
			))}
		</>
	);
}

