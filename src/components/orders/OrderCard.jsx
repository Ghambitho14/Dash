import { MapPin, Clock, Trash2 } from 'lucide-react';
import { formatStatusForCompany, useCurrentTime, formatRelativeTime, formatPrice } from '../../utils/utils';
import '../../styles/Components/OrderCard.css';

// Función para obtener iniciales
function getInitials(name) {
	if (!name) return '??';
	return name
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function OrderCard({ order, onClick, onDelete }) {
	const currentTime = useCurrentTime();
	const clientName = order.clientName || 'Cliente';
	const clientPhone = order.clientPhone || '';

	const handleDelete = (e) => {
		e.stopPropagation();
		onDelete?.(order.id);
	};

	// Mapear estados a clases CSS según Figma
	const getStatusClass = (status) => {
		const statusMap = {
			'Pendiente': 'pending',
			'Asignado': 'in-progress',
			'En camino al retiro': 'in-progress',
			'Producto retirado': 'in-progress',
			'Entregado': 'completed',
		};
		return statusMap[status] || 'pending';
	};

	return (
		<div
			onClick={onClick}
			className="delivery-order-card"
		>
		{/* Header con ID y Estado */}
		<div className="delivery-order-header">
			<span className="delivery-order-id">{order.id}</span>
			<div className="delivery-order-header-right">
				<span className={`delivery-order-status ${getStatusClass(order.status)}`}>
					{formatStatusForCompany(order.status)}
				</span>
				{onDelete && (
					<button
						className="delivery-order-delete"
						onClick={handleDelete}
						title="Eliminar pedido"
					>
						<Trash2 size={16} />
					</button>
				)}
			</div>
		</div>

			{/* Cliente */}
			<div className="delivery-order-client">
				<div className="delivery-order-client-avatar">
					{getInitials(clientName)}
				</div>
				<div className="delivery-order-client-info">
					<h4>{clientName}</h4>
					{clientPhone && <p>{clientPhone}</p>}
				</div>
			</div>

			{/* Direcciones */}
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

			{/* Footer con Tiempo y Precio */}
			<div className="delivery-order-footer">
				<div className="delivery-order-time">
					<Clock size={12} />
					{formatRelativeTime(order.createdAt, currentTime)}
				</div>
				<div className="delivery-order-price">
					${formatPrice(order.suggestedPrice)}
				</div>
			</div>
		</div>
	);
}

