import { ReactNode } from 'react';
import { User } from '../types/user';
import { Building2, LogOut } from 'lucide-react';
import '../styles/layouts/CompanyLayout.css';

interface CompanyLayoutProps {
	children: ReactNode;
	currentUser: User;
	onLogout: () => void;
}

export function CompanyLayout({ children, currentUser, onLogout }: CompanyLayoutProps) {
	return (
		<div className="company-layout">
			{/* Header fijo */}
			<header className="company-layout-header">
				<div className="company-layout-header-content">
					<div className="company-layout-header-left">
						<h1 className="company-layout-title">DeliveryApp MVP</h1>
						<div className="company-layout-user-badge">
							<span className="company-layout-user-name">{currentUser.name}</span>
						</div>
					</div>
					<button
						onClick={onLogout}
						className="company-layout-logout-button"
						title="Salir"
					>
						<LogOut />
						<span className="company-layout-button-text">Salir</span>
					</button>
				</div>
			</header>

			{/* Contenido */}
			<main className="company-layout-main">
				{children}
			</main>
		</div>
	);
}

