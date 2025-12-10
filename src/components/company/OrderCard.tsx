import { Order } from '../../types/order';
import { MapPin, Navigation, DollarSign, User, Clock, Trash2, Package, Building2, Key } from 'lucide-react';
import { getStatusColor, getStatusIcon, formatStatusForCompany } from '../../utils/statusUtils';
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

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(order.id);
	};

	return (
		<div
			onClick={onClick}
			className="order-card-company"
		>
			{/* Header con ID y Estado */}
			<div className="order-card-company-header">
				<div className="order-card-company-main">
					<div className="order-card-company-title-row">
						<div className="order-card-company-icon">
							<Building2 />
						</div>
						<div>
							<h3 className="order-card-company-title">{order.id}</h3>
							<div className="order-card-company-time">
								<Clock />
								<span className="order-card-company-time-text">{formatRelativeTime(order.createdAt, currentTime)}</span>
							</div>
						</div>
					</div>
					<div className={`order-card-company-status ${statusColor}`}>
						<StatusIcon style={{ width: '1rem', height: '1rem' }} />
						<span>{formatStatusForCompany(order.status)}</span>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					<div className="order-card-company-price">
						<DollarSign />
						<span className="order-card-company-price-text">${formatPrice(order.suggestedPrice)}</span>
					</div>
					{onDelete && (
						<button
							onClick={handleDelete}
							className="order-card-company-delete"
							title="Eliminar pedido"
						>
							<Trash2 />
						</button>
					)}
				</div>
			</div>

			{/* Información del Local */}
			<div className="order-card-company-local">
				<div className="order-card-company-local-content">
					<Package />
					<span className="order-card-company-local-text">{order.local}</span>
				</div>
			</div>

			{/* Código de Retiro */}
			<div className="order-card-company-code">
				<div className="order-card-company-code-content">
					<Key />
					<div>
						<p className="order-card-company-code-label">Código de Retiro</p>
						<p className="order-card-company-code-value">{order.pickupCode}</p>
					</div>
				</div>
			</div>

			{/* Direcciones */}
			<div className="order-card-company-addresses">
				<div className="order-card-company-address order-card-company-address-pickup">
					<MapPin className="order-card-company-address-icon" />
					<div className="order-card-company-address-content">
						<p className="order-card-company-address-label">Retiro</p>
						<p className="order-card-company-address-text">{order.pickupAddress}</p>
					</div>
				</div>
				<div className="order-card-company-address order-card-company-address-delivery">
					<Navigation className="order-card-company-address-icon" />
					<div className="order-card-company-address-content">
						<p className="order-card-company-address-label">Entrega</p>
						<p className="order-card-company-address-text">{order.deliveryAddress}</p>
					</div>
				</div>
			</div>

			{/* Footer con Repartidor */}
			{order.driverName && (
				<div className="order-card-company-driver">
					<div className="order-card-company-driver-avatar">
						<User />
					</div>
					<div>
						<p className="order-card-company-driver-label">Repartidor asignado</p>
						<p className="order-card-company-driver-name">{order.driverName}</p>
					</div>
				</div>
			)}
		</div>
	);
}

