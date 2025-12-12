import { Building2, LogOut } from 'lucide-react';
import '../styles/Components/CompanyLayout.css';

export function CompanyLayout({ children, currentUser, onLogout }) {
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

