import { Wallet, DollarSign, TrendingUp, Clock } from 'lucide-react';
import '../../styles/Components/DriverWallet.css';

export function DriverWallet({ orders = [] }) {
	// Obtener pedidos entregados del driver
	const driver = JSON.parse(localStorage.getItem('driver') || '{}');
	// Usar los orders pasados como prop (vienen de Supabase)
	const ordersToUse = orders || [];
	const deliveredOrders = ordersToUse.filter(o => o.driverId === driver?.id && o.status === 'Entregado');
	const pendingOrders = ordersToUse.filter(o => o.driverId === driver?.id && o.status !== 'Entregado' && o.status !== 'Pendiente');
	
	const totalEarnings = deliveredOrders.reduce((sum, order) => sum + (order.suggestedPrice || 0), 0);
	const pendingEarnings = pendingOrders.reduce((sum, order) => sum + (order.suggestedPrice || 0), 0);
	const completedOrders = deliveredOrders.length;

	return (
		<div className="driver-wallet">
			<div className="driver-wallet-header">
				<h2>Mi Billetera</h2>
				<p>Gestiona tus ganancias y pagos</p>
			</div>

			<div className="driver-wallet-content">
				<div className="driver-wallet-card driver-wallet-card-primary">
					<div className="driver-wallet-card-icon">
						<Wallet />
					</div>
					<div className="driver-wallet-card-content">
						<p className="driver-wallet-card-label">Total Ganado</p>
						<p className="driver-wallet-card-value">${totalEarnings.toLocaleString('es-CL')}</p>
					</div>
				</div>

				<div className="driver-wallet-stats">
					<div className="driver-wallet-stat-card">
						<div className="driver-wallet-stat-icon driver-wallet-stat-icon-orange">
							<Clock />
						</div>
						<div className="driver-wallet-stat-content">
							<p className="driver-wallet-stat-label">Pendiente</p>
							<p className="driver-wallet-stat-value">${pendingEarnings.toLocaleString('es-CL')}</p>
						</div>
					</div>

					<div className="driver-wallet-stat-card">
						<div className="driver-wallet-stat-icon driver-wallet-stat-icon-green">
							<TrendingUp />
						</div>
						<div className="driver-wallet-stat-content">
							<p className="driver-wallet-stat-label">Pedidos Completados</p>
							<p className="driver-wallet-stat-value">{completedOrders}</p>
						</div>
					</div>
				</div>

				<div className="driver-wallet-section">
					<h3 className="driver-wallet-section-title">Historial de Pagos</h3>
					<div className="driver-wallet-empty">
						<p>No hay pagos registrados aún</p>
					</div>
				</div>
			</div>
		</div>
	);
}

