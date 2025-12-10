import { X, User, Wallet, Package, Settings } from 'lucide-react';
import './DriverSidebar.css';

interface DriverSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	activeView: 'orders' | 'profile' | 'wallet' | 'settings';
	onViewChange: (view: 'orders' | 'profile' | 'wallet' | 'settings') => void;
	driverName: string;
}

export function DriverSidebar({ isOpen, onClose, activeView, onViewChange, driverName }: DriverSidebarProps) {
	const menuItems = [
		{ id: 'orders' as const, label: 'Pedidos', icon: Package },
		{ id: 'profile' as const, label: 'Perfil', icon: User },
		{ id: 'wallet' as const, label: 'Billetera', icon: Wallet },
		{ id: 'settings' as const, label: 'Ajustes', icon: Settings },
	];

	return (
		<>
			{isOpen && <div className="driver-sidebar-overlay" onClick={onClose} />}
			<div className={`driver-sidebar ${isOpen ? 'driver-sidebar-open' : ''}`}>
				<div className="driver-sidebar-header">
					<div className="driver-sidebar-user">
						<div className="driver-sidebar-avatar">
							<User />
						</div>
						<div className="driver-sidebar-user-info">
							<h3>{driverName}</h3>
							<p>Repartidor</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="driver-sidebar-close"
						aria-label="Cerrar menú"
					>
						<X />
					</button>
				</div>

				<nav className="driver-sidebar-nav">
					{menuItems.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.id}
								onClick={() => {
									onViewChange(item.id);
									onClose();
								}}
								className={`driver-sidebar-item ${activeView === item.id ? 'driver-sidebar-item-active' : ''}`}
							>
								<Icon />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>
			</div>
		</>
	);
}

