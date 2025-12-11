import { Bell, Shield, Moon, Globe } from 'lucide-react';
import '../styles/Components/DriverSettings.css';

export function DriverSettings() {
	return (
		<div className="driver-settings">
			<div className="driver-settings-header">
				<h2>Ajustes</h2>
				<p>Configura tu aplicación</p>
			</div>

			<div className="driver-settings-content">
				<div className="driver-settings-section">
					<h3 className="driver-settings-section-title">Notificaciones</h3>
					<div className="driver-settings-item">
						<div className="driver-settings-item-content">
							<div className="driver-settings-item-icon">
								<Bell />
							</div>
							<div className="driver-settings-item-text">
								<p className="driver-settings-item-label">Notificaciones Push</p>
								<p className="driver-settings-item-description">Recibe notificaciones de nuevos pedidos</p>
							</div>
						</div>
						<label className="driver-settings-toggle">
							<input type="checkbox" defaultChecked />
							<span className="driver-settings-toggle-slider"></span>
						</label>
					</div>
				</div>

				<div className="driver-settings-section">
					<h3 className="driver-settings-section-title">Privacidad</h3>
					<div className="driver-settings-item">
						<div className="driver-settings-item-content">
							<div className="driver-settings-item-icon">
								<Shield />
							</div>
							<div className="driver-settings-item-text">
								<p className="driver-settings-item-label">Compartir ubicación</p>
								<p className="driver-settings-item-description">Permite que la app use tu ubicación GPS</p>
							</div>
						</div>
						<label className="driver-settings-toggle">
							<input type="checkbox" defaultChecked />
							<span className="driver-settings-toggle-slider"></span>
						</label>
					</div>
				</div>

				<div className="driver-settings-section">
					<h3 className="driver-settings-section-title">Apariencia</h3>
					<div className="driver-settings-item">
						<div className="driver-settings-item-content">
							<div className="driver-settings-item-icon">
								<Moon />
							</div>
							<div className="driver-settings-item-text">
								<p className="driver-settings-item-label">Modo Oscuro</p>
								<p className="driver-settings-item-description">Activa el tema oscuro</p>
							</div>
						</div>
						<label className="driver-settings-toggle">
							<input type="checkbox" />
							<span className="driver-settings-toggle-slider"></span>
						</label>
					</div>
				</div>

				<div className="driver-settings-section">
					<h3 className="driver-settings-section-title">Idioma</h3>
					<div className="driver-settings-item">
						<div className="driver-settings-item-content">
							<div className="driver-settings-item-icon">
								<Globe />
							</div>
							<div className="driver-settings-item-text">
								<p className="driver-settings-item-label">Idioma</p>
								<p className="driver-settings-item-description">Español (Chile)</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

