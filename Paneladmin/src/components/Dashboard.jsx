import { useState, useEffect } from 'react';
import { Building2, UserPlus, LogOut, Plus, X, Edit2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import '../style/Dashboard.css';

export function Dashboard({ admin, onLogout }) {
	const [activeTab, setActiveTab] = useState('companies');
	const [companies, setCompanies] = useState([]);
	const [drivers, setDrivers] = useState([]);
	const [showCompanyForm, setShowCompanyForm] = useState(false);
	const [showDriverForm, setShowDriverForm] = useState(false);
	const [editingCompany, setEditingCompany] = useState(null);
	const [editingDriver, setEditingDriver] = useState(null);
	const [loading, setLoading] = useState(false);

	// Formulario de empresa
	const [companyForm, setCompanyForm] = useState({
		name: '',
		business_name: '',
		tax_id: '',
		phone: '',
		email: '',
		address: '',
		username: '',
		password: '',
	});

	// Formulario de repartidor
	const [driverForm, setDriverForm] = useState({
		username: '',
		password: '',
		name: '',
		phone: '',
		email: '',
		company_id: '',
	});

	useEffect(() => {
		loadCompanies();
		loadDrivers();
	}, []);

	const loadCompanies = async () => {
		try {
			const { data, error } = await supabase
				.from('companies')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setCompanies(data || []);
		} catch (err) {
			console.error('Error cargando empresas:', err);
		}
	};

	const loadDrivers = async () => {
		try {
			const { data, error } = await supabase
				.from('drivers')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setDrivers(data || []);
		} catch (err) {
			console.error('Error cargando repartidores:', err);
		}
	};

	const handleCreateCompany = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (editingCompany) {
				// Actualizar empresa existente
				const { data: companyData, error: companyError } = await supabase
					.from('companies')
					.update({
						name: companyForm.name,
						business_name: companyForm.business_name,
						tax_id: companyForm.tax_id || null,
						phone: companyForm.phone,
						email: companyForm.email || null,
						address: companyForm.address || null,
					})
					.eq('id', editingCompany.id)
					.select()
					.single();

				if (companyError) throw companyError;

				// Actualizar usuario si se cambió username o password
				if (companyForm.username || companyForm.password) {
					const updateData = {};
					if (companyForm.username) updateData.username = companyForm.username;
					if (companyForm.password) updateData.password = companyForm.password;

					const { error: userError } = await supabase
						.from('company_users')
						.update(updateData)
						.eq('company_id', editingCompany.id)
						.eq('role', 'empresarial');

					if (userError) {
						console.error('Error actualizando usuario:', userError);
						throw userError;
					}
				}

				setCompanies(companies.map(c => c.id === editingCompany.id ? companyData : c));
				setEditingCompany(null);
			} else {
				// Crear nueva empresa
				const { data: companyData, error: companyError } = await supabase
					.from('companies')
					.insert({
						name: companyForm.name,
						business_name: companyForm.business_name,
						tax_id: companyForm.tax_id || null,
						phone: companyForm.phone,
						email: companyForm.email || null,
						address: companyForm.address || null,
						superadmin_id: admin.id,
						active: true,
					})
					.select()
					.single();

				if (companyError) throw companyError;

				// Crear el usuario empresarial para acceder a la app
				if (companyForm.username && companyForm.password) {
					const { data: userData, error: userError } = await supabase
						.from('company_users')
						.insert({
							company_id: companyData.id,
							username: companyForm.username,
							password: companyForm.password,
							role: 'empresarial',
							name: companyForm.name,
						})
						.select()
						.single();

					if (userError) {
						console.error('Error creando usuario:', userError);
						await supabase.from('companies').delete().eq('id', companyData.id);
						throw userError;
					}
					
					console.log('Usuario creado exitosamente:', userData);
				} else {
					throw new Error('Usuario y contraseña son requeridos');
				}

				setCompanies([companyData, ...companies]);
			}

			setCompanyForm({
				name: '',
				business_name: '',
				tax_id: '',
				phone: '',
				email: '',
				address: '',
				username: '',
				password: '',
			});
			setShowCompanyForm(false);
		} catch (err) {
			alert('Error al ' + (editingCompany ? 'actualizar' : 'crear') + ' empresa: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateDriver = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (editingDriver) {
				// Actualizar repartidor existente
				const { data, error } = await supabase
					.from('drivers')
					.update({
						username: driverForm.username,
						password: driverForm.password,
						name: driverForm.name,
						phone: driverForm.phone,
						email: driverForm.email || null,
						company_id: driverForm.company_id || null,
					})
					.eq('id', editingDriver.id)
					.select()
					.single();

				if (error) {
					console.error('Error actualizando repartidor:', error);
					throw error;
				}

				console.log('Repartidor actualizado exitosamente:', data);
				setDrivers(drivers.map(d => d.id === editingDriver.id ? data : d));
				setEditingDriver(null);
			} else {
				// Crear nuevo repartidor
				const { data, error } = await supabase
					.from('drivers')
					.insert({
						username: driverForm.username,
						password: driverForm.password,
						name: driverForm.name,
						phone: driverForm.phone,
						email: driverForm.email || null,
						company_id: driverForm.company_id || null,
						active: true,
					})
					.select()
					.single();

				if (error) {
					console.error('Error creando repartidor:', error);
					throw error;
				}

				console.log('Repartidor creado exitosamente:', data);
				setDrivers([data, ...drivers]);
			}

			setDriverForm({
				username: '',
				password: '',
				name: '',
				phone: '',
				email: '',
				company_id: '',
			});
			setShowDriverForm(false);
		} catch (err) {
			console.error('Error completo:', err);
			alert('Error al ' + (editingDriver ? 'actualizar' : 'crear') + ' repartidor: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleEditCompany = (company) => {
		setEditingCompany(company);
		setCompanyForm({
			name: company.name,
			business_name: company.business_name || '',
			tax_id: company.tax_id || '',
			phone: company.phone,
			email: company.email || '',
			address: company.address || '',
			username: '', // No mostramos el username actual por seguridad
			password: '', // No mostramos la contraseña actual por seguridad
		});
		setShowCompanyForm(true);
	};

	const handleEditDriver = (driver) => {
		setEditingDriver(driver);
		setDriverForm({
			username: driver.username,
			password: '', // No mostramos la contraseña actual por seguridad
			name: driver.name,
			phone: driver.phone,
			email: driver.email || '',
			company_id: driver.company_id || '',
		});
		setShowDriverForm(true);
	};

	const handleCancelEdit = () => {
		setEditingCompany(null);
		setEditingDriver(null);
		setShowCompanyForm(false);
		setShowDriverForm(false);
		setCompanyForm({
			name: '',
			business_name: '',
			tax_id: '',
			phone: '',
			email: '',
			address: '',
			username: '',
			password: '',
		});
		setDriverForm({
			username: '',
			password: '',
			name: '',
			phone: '',
			email: '',
			company_id: '',
		});
	};

	return (
		<div className="admin-dashboard">
			<header className="admin-dashboard-header">
				<div>
					<h1>Panel de Administración</h1>
					<p>Bienvenido, {admin.name}</p>
				</div>
				<button onClick={onLogout} className="admin-logout-button">
					<LogOut />
					Cerrar Sesión
				</button>
			</header>

			<div className="admin-dashboard-tabs">
				<button
					className={activeTab === 'companies' ? 'active' : ''}
					onClick={() => setActiveTab('companies')}
				>
					<Building2 />
					Empresas
				</button>
				<button
					className={activeTab === 'drivers' ? 'active' : ''}
					onClick={() => setActiveTab('drivers')}
				>
					<UserPlus />
					Repartidores
				</button>
			</div>

			<div className="admin-dashboard-content">
				{activeTab === 'companies' && (
					<div className="admin-section">
						<div className="admin-section-header">
							<h2>Empresas</h2>
							<button
								onClick={() => {
									setEditingCompany(null);
									setCompanyForm({
										name: '',
										business_name: '',
										tax_id: '',
										phone: '',
										email: '',
										address: '',
										username: '',
										password: '',
									});
									setShowCompanyForm(true);
								}}
								className="admin-add-button"
							>
								<Plus />
								Nueva Empresa
							</button>
						</div>

						{showCompanyForm && (
							<div className="admin-modal-overlay" onClick={() => setShowCompanyForm(false)}>
								<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
									<div className="admin-modal-header">
										<h3>{editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
										<button onClick={handleCancelEdit}>
											<X />
										</button>
									</div>
									<form onSubmit={handleCreateCompany} className="admin-form">
										<div className="admin-form-field">
											<label>Nombre *</label>
											<input
												type="text"
												value={companyForm.name}
												onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
												required
											/>
										</div>
										<div className="admin-form-field">
											<label>Razón Social</label>
											<input
												type="text"
												value={companyForm.business_name}
												onChange={(e) => setCompanyForm({ ...companyForm, business_name: e.target.value })}
											/>
										</div>
										<div className="admin-form-field">
											<label>RUT</label>
											<input
												type="text"
												value={companyForm.tax_id}
												onChange={(e) => setCompanyForm({ ...companyForm, tax_id: e.target.value })}
											/>
										</div>
										<div className="admin-form-field">
											<label>Teléfono *</label>
											<input
												type="tel"
												value={companyForm.phone}
												onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
												required
											/>
										</div>
										<div className="admin-form-field">
											<label>Email</label>
											<input
												type="email"
												value={companyForm.email}
												onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
											/>
										</div>
										<div className="admin-form-field">
											<label>Dirección</label>
											<textarea
												value={companyForm.address}
												onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
												rows="3"
											/>
										</div>
										{!editingCompany && (
											<>
												<div className="admin-form-field">
													<label>Usuario para App Principal *</label>
													<input
														type="text"
														value={companyForm.username}
														onChange={(e) => setCompanyForm({ ...companyForm, username: e.target.value })}
														placeholder="Usuario para acceder a la app"
														required
													/>
												</div>
												<div className="admin-form-field">
													<label>Contraseña para App Principal *</label>
													<input
														type="password"
														value={companyForm.password}
														onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
														placeholder="Contraseña para acceder a la app"
														required
													/>
												</div>
											</>
										)}
										{editingCompany && (
											<>
												<div className="admin-form-field">
													<label>Nuevo Usuario (opcional)</label>
													<input
														type="text"
														value={companyForm.username}
														onChange={(e) => setCompanyForm({ ...companyForm, username: e.target.value })}
														placeholder="Dejar vacío para no cambiar"
													/>
												</div>
												<div className="admin-form-field">
													<label>Nueva Contraseña (opcional)</label>
													<input
														type="password"
														value={companyForm.password}
														onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
														placeholder="Dejar vacío para no cambiar"
													/>
												</div>
											</>
										)}
										<div className="admin-form-actions">
											<button type="button" onClick={handleCancelEdit}>
												Cancelar
											</button>
											<button type="submit" disabled={loading}>
												{loading ? (editingCompany ? 'Actualizando...' : 'Creando...') : (editingCompany ? 'Actualizar Empresa' : 'Crear Empresa')}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}

						<div className="admin-list">
							{companies.length === 0 ? (
								<p className="admin-empty">No hay empresas registradas</p>
							) : (
								companies.map((company) => (
									<div key={company.id} className="admin-card">
										<div>
											<h3>{company.name}</h3>
											<p>{company.business_name || company.email || company.phone}</p>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
											<span className={company.active ? 'status-active' : 'status-inactive'}>
												{company.active ? 'Activa' : 'Inactiva'}
											</span>
											<button
												onClick={() => handleEditCompany(company)}
												className="admin-edit-button"
												title="Editar empresa"
											>
												<Edit2 size={16} />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}

				{activeTab === 'drivers' && (
					<div className="admin-section">
						<div className="admin-section-header">
							<h2>Repartidores</h2>
							<button
								onClick={() => {
									setEditingDriver(null);
									setDriverForm({
										username: '',
										password: '',
										name: '',
										phone: '',
										email: '',
										company_id: '',
									});
									setShowDriverForm(true);
								}}
								className="admin-add-button"
							>
								<Plus />
								Nuevo Repartidor
							</button>
						</div>

						{showDriverForm && (
							<div className="admin-modal-overlay" onClick={() => setShowDriverForm(false)}>
								<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
									<div className="admin-modal-header">
										<h3>{editingDriver ? 'Editar Repartidor' : 'Nuevo Repartidor'}</h3>
										<button onClick={handleCancelEdit}>
											<X />
										</button>
									</div>
									<form onSubmit={handleCreateDriver} className="admin-form">
										<div className="admin-form-field">
											<label>Usuario *</label>
											<input
												type="text"
												value={driverForm.username}
												onChange={(e) => setDriverForm({ ...driverForm, username: e.target.value })}
												required
											/>
										</div>
										<div className="admin-form-field">
											<label>{editingDriver ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</label>
											<input
												type="password"
												value={driverForm.password}
												onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
												placeholder={editingDriver ? 'Dejar vacío para no cambiar' : ''}
												required={!editingDriver}
											/>
										</div>
										<div className="admin-form-field">
											<label>Nombre *</label>
											<input
												type="text"
												value={driverForm.name}
												onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
												required
											/>
										</div>
										<div className="admin-form-field">
											<label>Teléfono *</label>
											<input
												type="tel"
												value={driverForm.phone}
												onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
												required
											/>
										</div>
										<div className="admin-form-field">
											<label>Email</label>
											<input
												type="email"
												value={driverForm.email}
												onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
											/>
										</div>
										<div className="admin-form-field">
											<label>Empresa (Opcional)</label>
											<select
												value={driverForm.company_id}
												onChange={(e) => setDriverForm({ ...driverForm, company_id: e.target.value })}
											>
												<option value="">Sin empresa</option>
												{companies.map((company) => (
													<option key={company.id} value={company.id}>
														{company.name}
													</option>
												))}
											</select>
										</div>
										<div className="admin-form-actions">
											<button type="button" onClick={handleCancelEdit}>
												Cancelar
											</button>
											<button type="submit" disabled={loading}>
												{loading ? (editingDriver ? 'Actualizando...' : 'Creando...') : (editingDriver ? 'Actualizar Repartidor' : 'Crear Repartidor')}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}

						<div className="admin-list">
							{drivers.length === 0 ? (
								<p className="admin-empty">No hay repartidores registrados</p>
							) : (
								drivers.map((driver) => (
									<div key={driver.id} className="admin-card">
										<div>
											<h3>{driver.name}</h3>
											<p>{driver.username} • {driver.phone}</p>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
											<span className={driver.active ? 'status-active' : 'status-inactive'}>
												{driver.active ? 'Activo' : 'Inactivo'}
											</span>
											<button
												onClick={() => handleEditDriver(driver)}
												className="admin-edit-button"
												title="Editar repartidor"
											>
												<Edit2 size={16} />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

