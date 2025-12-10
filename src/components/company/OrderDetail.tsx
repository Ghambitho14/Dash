import { Order } from '../../types/order';
import { X, MapPin, Navigation, DollarSign, User, Clock, Package, Building2, Key } from 'lucide-react';
import { getStatusIcon, formatStatusForCompany } from '../../utils/statusUtils';
import { formatDate } from '../../utils/dateUtils';
import { formatPrice } from '../../utils/priceUtils';
import '../../styles/Components/company/OrderDetail.css';

interface OrderDetailProps {
	order: Order;
	onClose: () => void;
}

export function OrderDetail({ order, onClose }: OrderDetailProps) {
	const StatusIcon = getStatusIcon(order.status);

	return (
		<div className="order-detail-company">
			{/* Header */}
			<div className="order-detail-company-header">
				<div className="order-detail-company-header-main">
					<div className="order-detail-company-header-top">
						<div className="order-detail-company-header-icon">
							<Building2 />
						</div>
						<div>
							<h2 className="order-detail-company-header-title">{order.id}</h2>
							<div className="order-detail-company-header-time">
								<Clock />
								<span>Creado: {formatDate(order.createdAt)}</span>
							</div>
						</div>
					</div>
				</div>
				<button
					onClick={onClose}
					className="order-detail-company-close"
					aria-label="Cerrar"
				>
					<X />
				</button>
			</div>

			{/* Order Details */}
			<div className="order-detail-company-content">
				{/* Estado del Pedido */}
				<div className="order-detail-company-item">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-blue">
						<StatusIcon />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label">Estado del Pedido</p>
						<p className="order-detail-company-item-value">{formatStatusForCompany(order.status)}</p>
					</div>
				</div>

				{/* Repartidor */}
				<div className="order-detail-company-item">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-purple">
						<User />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label">Repartidor</p>
						<p className="order-detail-company-item-value">{order.driverName || 'sin asignar'}</p>
					</div>
				</div>

				{/* Local */}
				<div className="order-detail-company-item">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-gray">
						<Package />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label">Local</p>
						<p className="order-detail-company-item-value">{order.local}</p>
					</div>
				</div>

				{/* Código de Retiro */}
				<div className="order-detail-company-item order-detail-company-item-code">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-yellow">
						<Key />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label">Código de Retiro</p>
						<p className="order-detail-company-item-value order-detail-company-item-code-value">{order.pickupCode}</p>
					</div>
				</div>

				{/* Pickup Address */}
				<div className="order-detail-company-item order-detail-company-item-start">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-blue">
						<MapPin />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label">Dirección de Retiro</p>
						<p className="order-detail-company-item-text">{order.pickupAddress}</p>
					</div>
				</div>

				{/* Delivery Address */}
				<div className="order-detail-company-item order-detail-company-item-start">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-orange">
						<Navigation />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label">Dirección de Entrega</p>
						<p className="order-detail-company-item-text">{order.deliveryAddress}</p>
					</div>
				</div>

				{/* Precio del Reparto */}
				<div className="order-detail-company-item order-detail-company-item-price">
					<div className="order-detail-company-item-icon order-detail-company-item-icon-green">
						<DollarSign />
					</div>
					<div className="order-detail-company-item-content">
						<p className="order-detail-company-item-label order-detail-company-item-price-label">Precio del Reparto</p>
						<p className="order-detail-company-item-price-value">${formatPrice(order.suggestedPrice)}</p>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="order-detail-company-actions">
				<button
					onClick={onClose}
					className="order-detail-company-button order-detail-company-button-primary"
				>
					Cerrar
				</button>
			</div>
		</div>
	);
}

