import { User, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/Components/DriverProfile.css';

export function DriverProfile({ driverName }) {
	// Obtener información del driver desde localStorage
	const driver = JSON.parse(localStorage.getItem('driver') || '{}');
	const finalDriverName = driverName || driver.name || 'Repartidor';

	return (
		<div className="driver-profile">
			<div className="driver-profile-header">
				<h2>Mi Perfil</h2>
				<p>Gestiona tu información personal</p>
			</div>

			<div className="driver-profile-content">
				<div className="driver-profile-card">
					<div className="driver-profile-avatar-section">
						<div className="driver-profile-avatar-large">
							<User />
						</div>
						<h3>{finalDriverName}</h3>
						<p className="driver-profile-role">Repartidor</p>
					</div>

					<div className="driver-profile-info">
						{driver.email && (
							<div className="driver-profile-field">
								<div className="driver-profile-field-label">
									<Mail />
									<span>Correo Electrónico</span>
								</div>
								<p className="driver-profile-field-value">{driver.email}</p>
							</div>
						)}

						{driver.phone && (
							<div className="driver-profile-field">
								<div className="driver-profile-field-label">
									<Phone />
									<span>Teléfono</span>
								</div>
								<p className="driver-profile-field-value">{driver.phone}</p>
							</div>
						)}

						{driver.address && (
							<div className="driver-profile-field">
								<div className="driver-profile-field-label">
									<MapPin />
									<span>Dirección</span>
								</div>
								<p className="driver-profile-field-value">{driver.address}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

