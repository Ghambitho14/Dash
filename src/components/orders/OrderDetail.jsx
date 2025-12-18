import { X, MapPin, Navigation, DollarSign, User, Clock, Package, Key } from 'lucide-react';
import { getStatusIcon, formatStatusForCompany, formatDate, formatPrice, useCurrentTime, formatRelativeTime } from '../../utils/utils';
import '../../styles/Components/OrderDetail.css';

export function OrderDetail({ order, onClose }) {
	const StatusIcon = getStatusIcon(order.status);
	const currentTime = useCurrentTime();

	// Mapear estados a clases CSS según OrderCard
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
		<div className="detalle-pedido-empresa">
			{/* Header - Estilo OrderCard */}
			<div className="detalle-pedido-empresa-header">
				<div className="detalle-pedido-empresa-header-main">
					<div className="detalle-pedido-empresa-header-top">
						<div>
							<h2 className="detalle-pedido-empresa-header-title">{order.id}</h2>
							<div className="detalle-pedido-empresa-header-time">
								<Clock />
								<span>{formatRelativeTime(order.createdAt, currentTime)}</span>
							</div>
						</div>
						<span className={`delivery-order-status ${getStatusClass(order.status)}`}>
							{formatStatusForCompany(order.status)}
						</span>
					</div>
				</div>
				<button
					onClick={onClose}
					className="detalle-pedido-empresa-close"
					aria-label="Cerrar"
				>
					<X />
				</button>
			</div>

			{/* Order Details */}
			<div className="detalle-pedido-empresa-content">
				{/* Estado del Pedido */}
				<div className="detalle-pedido-empresa-item">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-blue">
						<StatusIcon />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label">Estado del Pedido</p>
						<p className="detalle-pedido-empresa-item-value">{formatStatusForCompany(order.status)}</p>
					</div>
				</div>

				{/* Repartidor */}
				<div className="detalle-pedido-empresa-item">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-purple">
						<User />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label">Repartidor</p>
						<p className="detalle-pedido-empresa-item-value">{order.driverName || 'sin asignar'}</p>
					</div>
				</div>

				{/* Local */}
				<div className="detalle-pedido-empresa-item">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-gray">
						<Package />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label">Local</p>
						<p className="detalle-pedido-empresa-item-value">{order.local}</p>
					</div>
				</div>

				{/* Código de Retiro */}
				<div className="detalle-pedido-empresa-item detalle-pedido-empresa-item-code">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-yellow">
						<Key />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label">Código de Retiro</p>
						<p className="detalle-pedido-empresa-item-value detalle-pedido-empresa-item-code-value">{order.pickupCode}</p>
					</div>
				</div>

				{/* Pickup Address */}
				<div className="detalle-pedido-empresa-item detalle-pedido-empresa-item-start">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-blue">
						<MapPin />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label">Dirección de Retiro</p>
						<p className="detalle-pedido-empresa-item-text">{order.pickupAddress}</p>
					</div>
				</div>

				{/* Delivery Address */}
				<div className="detalle-pedido-empresa-item detalle-pedido-empresa-item-start">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-orange">
						<Navigation />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label">Dirección de Entrega</p>
						<p className="detalle-pedido-empresa-item-text">{order.deliveryAddress}</p>
					</div>
				</div>

				{/* Precio del Reparto */}
				<div className="detalle-pedido-empresa-item detalle-pedido-empresa-item-price">
					<div className="detalle-pedido-empresa-item-icon detalle-pedido-empresa-item-icon-green">
						<DollarSign />
					</div>
					<div className="detalle-pedido-empresa-item-content">
						<p className="detalle-pedido-empresa-item-label detalle-pedido-empresa-item-price-label">Precio del Reparto</p>
						<p className="detalle-pedido-empresa-item-price-value">${formatPrice(order.suggestedPrice)}</p>
					</div>
				</div>

			</div>

			{/* Actions */}
			<div className="detalle-pedido-empresa-actions">
				<button
					onClick={onClose}
					className="detalle-pedido-empresa-button detalle-pedido-empresa-button-primary"
				>
					Cerrar
				</button>
			</div>
		</div>
	);
}

