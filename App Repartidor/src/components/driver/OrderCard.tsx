import { useState, useEffect } from 'react';
import { Order } from '../../types/order';
import { MapPin, Navigation, DollarSign, Clock, Trash2, Package, AlertCircle } from 'lucide-react';
import { getStatusColor, getStatusIcon } from '../../utils/statusUtils';
import { useCurrentTime, formatRelativeTime } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/priceUtils';
import './OrderCard.css';

interface OrderCardProps {
	order: Order;
	onClick: () => void;
	onDelete?: (orderId: string) => void;
}

export function OrderCard({ order, onClick, onDelete }: OrderCardProps) {
	const currentTime = useCurrentTime();
	const statusColor = getStatusColor(order.status);
	const StatusIcon = getStatusIcon(order.status);
	const isAssigned = order.status === 'Asignado';
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

	// Calcular tiempo restante si el pedido está "Asignado"
	useEffect(() => {
		if (order.status === 'Asignado') {
			const updateTimer = () => {
				const now = new Date();
				const updatedAt = new Date(order.updatedAt);
				const elapsed = Math.floor((now.getTime() - updatedAt.getTime()) / 1000); // segundos transcurridos
				const remaining = Math.max(0, 60 - elapsed); // 60 segundos = 1 minuto
				setTimeRemaining(remaining);
			};

			updateTimer();
			const interval = setInterval(updateTimer, 1000);

			return () => clearInterval(interval);
		} else {
			setTimeRemaining(null);
		}
	}, [order.status, order.updatedAt]);

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(order.id);
	};

	return (
		<div
			onClick={onClick}
			className={`order-card-driver ${isAssigned ? 'order-card-driver-assigned' : 'order-card-driver-available'}`}
		>
			{/* Badge de Urgencia para Asignado */}
			{isAssigned && (
				<div className="order-card-driver-badge">
					<AlertCircle />
					¡En camino!
				</div>
			)}

			{/* Header Compacto */}
			<div className="order-card-driver-header">
				<div className="order-card-driver-main">
					<div className="order-card-driver-title-row">
						<div className={`order-card-driver-status-icon ${statusColor}`}>
							<StatusIcon />
						</div>
						<div>
							<p className="order-card-driver-id">{order.id}</p>
							<div className="order-card-driver-time">
								<Clock />
								<span className="order-card-driver-time-text">{formatRelativeTime(order.createdAt, currentTime)}</span>
							</div>
						</div>
					</div>
				</div>
				{onDelete && (
					<button
						onClick={handleDelete}
						className="order-card-driver-delete"
						title="Eliminar pedido"
					>
						<Trash2 />
					</button>
				)}
			</div>

			{/* Precio Destacado */}
			<div className="order-card-driver-price">
				<div className="order-card-driver-price-badge">
					<DollarSign />
					<span className="order-card-driver-price-text">${formatPrice(order.suggestedPrice)}</span>
				</div>
			</div>

			{/* Local */}
			<div className="order-card-driver-local">
				<Package />
				<span className="order-card-driver-local-text">{order.local}</span>
			</div>

			{/* Direcciones Compactas */}
			<div className="order-card-driver-addresses">
				<div className="order-card-driver-address order-card-driver-address-pickup">
					<MapPin className="order-card-driver-address-icon" />
					<div className="order-card-driver-address-content">
						<p className="order-card-driver-address-label">Retiro</p>
						<p className="order-card-driver-address-text">{order.pickupAddress}</p>
					</div>
				</div>
				<div className="order-card-driver-address order-card-driver-address-delivery">
					<Navigation className="order-card-driver-address-icon" />
					<div className="order-card-driver-address-content">
						<p className="order-card-driver-address-label">Entrega</p>
						<p className="order-card-driver-address-text">{order.deliveryAddress}</p>
					</div>
				</div>
			</div>

			{/* Footer con Acción */}
			<div className="order-card-driver-footer">
				{isAssigned ? (
					<div className="order-card-driver-footer-assigned">
						<span className="order-card-driver-footer-assigned-text">
							¡Di que ya vas en camino!!
							{timeRemaining !== null && timeRemaining > 0 && (
								<span className="order-card-driver-timer">({timeRemaining}s)</span>
							)}
						</span>
						<span className="order-card-driver-footer-link">Ver detalles →</span>
					</div>
				) : (
					<span className="order-card-driver-footer-link-only">Ver detalles →</span>
				)}
			</div>
		</div>
	);
}

