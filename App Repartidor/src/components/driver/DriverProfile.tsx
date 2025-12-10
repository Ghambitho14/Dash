import { User, Mail, Phone, MapPin } from 'lucide-react';
import './DriverProfile.css';

interface DriverProfileProps {
	driverName: string;
}

export function DriverProfile({ driverName }: DriverProfileProps) {
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
						<h3>{driverName}</h3>
						<p className="driver-profile-role">Repartidor</p>
					</div>

					<div className="driver-profile-info">
						<div className="driver-profile-field">
							<div className="driver-profile-field-label">
								<Mail />
								<span>Correo Electrónico</span>
							</div>
							<p className="driver-profile-field-value">juan.perez@example.com</p>
						</div>

						<div className="driver-profile-field">
							<div className="driver-profile-field-label">
								<Phone />
								<span>Teléfono</span>
							</div>
							<p className="driver-profile-field-value">+56 9 1234 5678</p>
						</div>

						<div className="driver-profile-field">
							<div className="driver-profile-field-label">
								<MapPin />
								<span>Dirección</span>
							</div>
							<p className="driver-profile-field-value">Av. Principal 123, Santiago</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

