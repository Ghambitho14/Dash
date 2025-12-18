import { useEffect, useState, useRef, useMemo } from 'react';
import { getOrderDriverLocation, subscribeToDriverLocation } from '../../services/locationService';
import { geocodeAddress } from '../../utils/utils';
import { logger } from '../../utils/logger';
import { setupGoogleMapsErrorListener, getGoogleMapsErrorMessage } from '../../utils/googleMapsErrors';
import { MapPin, Package, Navigation, AlertCircle, Bike, Clock, X } from 'lucide-react';
import '../../styles/Components/TrackingPanel.css';

export function TrackingPanel({ orders, onSelectOrder }) {
	const [mapLoaded, setMapLoaded] = useState(false);
	const [loading, setLoading] = useState(false); // Cambiado a false - solo se activa durante geocodificación
	const [error, setError] = useState(null);
	const [selectedDriver, setSelectedDriver] = useState(null);
	const [driverLocations, setDriverLocations] = useState(new Map()); // driverId -> location
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markersRef = useRef([]);
	const subscriptionsRef = useRef([]);
	const orderCoordsRef = useRef(new Map()); // Cache de coordenadas por pedido
	const driverMarkersRef = useRef(new Map()); // driverId -> marker

	const apiKey = import.meta.env.VITE_API_KEY_MAPS;

	// Filtrar solo pedidos activos (no entregados)
	const activeOrders = orders.filter(order => order.status !== 'Entregado');

	// Agrupar pedidos por repartidor
	const driversWithOrders = useMemo(() => {
		const driversMap = new Map();
		
		activeOrders.forEach(order => {
			if (order.driverId && order.driverName && order.status !== 'Pendiente') {
				if (!driversMap.has(order.driverId)) {
					driversMap.set(order.driverId, {
						driverId: order.driverId,
						driverName: order.driverName,
						orders: [],
						location: driverLocations.get(order.driverId) || null,
					});
				}
				driversMap.get(order.driverId).orders.push(order);
			}
		});
		
		return Array.from(driversMap.values());
	}, [activeOrders, driverLocations]);

	// Cargar script de Google Maps
	useEffect(() => {
		if (!apiKey) {
			setError('API Key de Google Maps no configurada');
			setLoading(false);
			return;
		}

		// Verificar si ya está cargado
		if (window.google && window.google.maps) {
			setMapLoaded(true);
			return;
		}

		// Verificar si el script ya existe
		const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
		if (existingScript) {
			existingScript.addEventListener('load', () => {
				setMapLoaded(true);
			});
			if (window.google && window.google.maps) {
				setMapLoaded(true);
			}
			return;
		}

		// Cargar script de Google Maps con loading=async
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
		script.async = true;
		script.defer = true;
		script.onload = () => {
			setMapLoaded(true);
		};
		script.onerror = (error) => {
			const errorMessage = getGoogleMapsErrorMessage('ApiProjectMapError') || 
				'Error cargando Google Maps API. Verifica tu clave de API y las restricciones.';
			setError(errorMessage);
			setLoading(false);
			logger.error('Error cargando Google Maps API:', error);
		};
		document.head.appendChild(script);
		
		// Configurar listener para errores de Google Maps
		const cleanup = setupGoogleMapsErrorListener((errorMsg) => {
			setError(errorMsg);
			setLoading(false);
		});
		
		return cleanup;
	}, [apiKey]);

	// Geocodificar direcciones de pedidos
	useEffect(() => {
		if (!mapLoaded || activeOrders.length === 0) {
			setLoading(false);
			return;
		}

		const geocodeOrders = async () => {
			setLoading(true);
			const coordsMap = new Map();

			// Geocodificar direcciones con un pequeño delay entre cada una para evitar rate limiting
			for (const order of activeOrders) {
				const orderId = order.id;
				const pickupAddress = order.pickupAddress || order.localAddress;
				const deliveryAddress = order.deliveryAddress;

				const coords = {
					pickup: null,
					delivery: null,
				};

				if (pickupAddress) {
					// Verificar cache
					if (orderCoordsRef.current.has(pickupAddress)) {
						coords.pickup = orderCoordsRef.current.get(pickupAddress);
					} else {
						const pickupCoords = await geocodeAddress(pickupAddress);
						if (pickupCoords) {
							coords.pickup = pickupCoords;
							orderCoordsRef.current.set(pickupAddress, pickupCoords);
						}
					}
				}

				if (deliveryAddress) {
					// Verificar cache
					if (orderCoordsRef.current.has(deliveryAddress)) {
						coords.delivery = orderCoordsRef.current.get(deliveryAddress);
					} else {
						const deliveryCoords = await geocodeAddress(deliveryAddress);
						if (deliveryCoords) {
							coords.delivery = deliveryCoords;
							orderCoordsRef.current.set(deliveryAddress, deliveryCoords);
						}
					}
				}

				coordsMap.set(order.id, coords);
				
				// Pequeño delay para evitar rate limiting de Google Maps (50ms entre cada geocodificación)
				await new Promise(resolve => setTimeout(resolve, 50));
			}

			orderCoordsRef.current = coordsMap;
			setLoading(false);
		};

		geocodeOrders();
	}, [mapLoaded, activeOrders]);

	// Crear o actualizar marcador del repartidor
	const updateDriverMarker = (driverId, location, order = null) => {
		if (!mapInstanceRef.current || !window.google) return;

		const google = window.google;
		const position = { lat: location.latitude, lng: location.longitude };

		// Si ya existe el marcador, actualizarlo
		if (driverMarkersRef.current.has(driverId)) {
			const marker = driverMarkersRef.current.get(driverId);
			marker.setPosition(position);
			return;
		}

		// Crear nuevo marcador
		const driverMarker = new google.maps.Marker({
			position: position,
			map: mapInstanceRef.current,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 10,
				fillColor: '#ef4444',
				fillOpacity: 1,
				strokeColor: '#ffffff',
				strokeWeight: 2,
			},
			title: `Repartidor: ${order?.driverName || 'Sin nombre'}`,
		});

		const driverInfoWindow = new google.maps.InfoWindow({
			content: `
				<div style="padding: 0.5rem;">
					<h3 style="margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600;">Repartidor</h3>
					<p style="margin: 0; font-size: 0.75rem; color: #6b7280;">${order?.driverName || 'Sin nombre'}</p>
					${order ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Pedido: ${order.id}</p>` : ''}
				</div>
			`,
		});

		driverMarker.addListener('click', () => {
			driverInfoWindow.open(mapInstanceRef.current, driverMarker);
			if (order && onSelectOrder) {
				onSelectOrder(order);
			}
		});

		driverMarkersRef.current.set(driverId, driverMarker);
		markersRef.current.push(driverMarker);
	};

	// Cargar ubicación del repartidor
	const loadDriverLocation = async (order) => {
		if (!mapInstanceRef.current || !window.google) return;

		try {
			const location = await getOrderDriverLocation(order._dbId);
			if (location && location.latitude && location.longitude) {
				const locationData = {
					latitude: parseFloat(location.latitude),
					longitude: parseFloat(location.longitude),
					updated_at: location.updated_at,
				};

				// Actualizar estado de ubicación
				setDriverLocations(prev => {
					const newMap = new Map(prev);
					newMap.set(order.driverId, locationData);
					return newMap;
				});

				// Crear o actualizar marcador
				updateDriverMarker(order.driverId, locationData, order);

				// Suscribirse a actualizaciones de ubicación
				const unsubscribe = subscribeToDriverLocation(order.driverId, (newLocation) => {
					if (newLocation && newLocation.latitude && newLocation.longitude) {
						const updatedLocation = {
							latitude: parseFloat(newLocation.latitude),
							longitude: parseFloat(newLocation.longitude),
							updated_at: newLocation.updated_at,
						};
						
						setDriverLocations(prev => {
							const newMap = new Map(prev);
							newMap.set(order.driverId, updatedLocation);
							return newMap;
						});

						updateDriverMarker(order.driverId, updatedLocation, order);
					}
				});

				subscriptionsRef.current.push(unsubscribe);
			}
		} catch (err) {
			logger.error('Error cargando ubicación del repartidor:', err);
		}
	};

	// Inicializar mapa (crear siempre, incluso sin coordenadas)
	useEffect(() => {
		if (!mapLoaded || !mapRef.current) {
			return;
		}

		const timeoutId = setTimeout(() => {
			if (!window.google || !window.google.maps) {
				logger.error('Google Maps no está disponible');
				return;
			}

			// Crear mapa si no existe (incluso sin coordenadas)
			if (!mapInstanceRef.current) {
				const google = window.google;
				// Centro por defecto (Santiago, Chile - puedes cambiarlo)
				const defaultCenter = { lat: -33.4489, lng: -70.6693 };
				
				logger.log('🗺️ Creando mapa de Google Maps...');
				mapInstanceRef.current = new google.maps.Map(mapRef.current, {
					zoom: 12,
					center: defaultCenter,
					mapTypeControl: false,
					fullscreenControl: true,
					streetViewControl: false,
					styles: [
						{
							featureType: 'poi',
							elementType: 'labels',
							stylers: [{ visibility: 'off' }]
						}
					]
				});
				
				logger.log('✅ Mapa creado exitosamente');
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [mapLoaded]);

	// Actualizar mapa con coordenadas y marcadores
	useEffect(() => {
		if (!mapInstanceRef.current || !window.google || activeOrders.length === 0) {
			return;
		}

		// Esperar a que termine la geocodificación
		if (loading) {
			return;
		}

		const timeoutId = setTimeout(() => {
			const google = window.google;
			const bounds = new google.maps.LatLngBounds();
			const allCoords = [];

			// Recopilar todas las coordenadas
			activeOrders.forEach((order) => {
				const coords = orderCoordsRef.current.get(order.id);
				if (coords) {
					if (coords.pickup) {
						allCoords.push({ lat: coords.pickup.lat, lng: coords.pickup.lon });
						bounds.extend(new google.maps.LatLng(coords.pickup.lat, coords.pickup.lon));
					}
					if (coords.delivery) {
						allCoords.push({ lat: coords.delivery.lat, lng: coords.delivery.lon });
						bounds.extend(new google.maps.LatLng(coords.delivery.lat, coords.delivery.lon));
					}
				}
			});

			// Ajustar vista del mapa si hay coordenadas
			if (allCoords.length > 0) {
				if (allCoords.length > 1) {
					mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
				} else {
					mapInstanceRef.current.setCenter(allCoords[0]);
					mapInstanceRef.current.setZoom(15);
				}
				logger.log(`📍 Ajustando mapa a ${allCoords.length} ubicación(es)`);
			} else {
				logger.log('⏳ Esperando coordenadas para ajustar mapa...');
			}

			// Limpiar marcadores anteriores
			markersRef.current.forEach(marker => marker.setMap(null));
			markersRef.current = [];
			driverMarkersRef.current.clear();

			// Crear marcadores para cada pedido
			activeOrders.forEach((order) => {
				const coords = orderCoordsRef.current.get(order.id);
				if (!coords) {
					logger.log(`⏳ Pedido ${order.id}: Esperando coordenadas...`);
					return;
				}

				const map = mapInstanceRef.current;

				// Marcador de pickup (local)
				if (coords.pickup) {
					const pickupMarker = new google.maps.Marker({
						position: { lat: coords.pickup.lat, lng: coords.pickup.lon },
						map: map,
						icon: {
							path: google.maps.SymbolPath.CIRCLE,
							scale: 8,
							fillColor: '#3b82f6',
							fillOpacity: 1,
							strokeColor: '#ffffff',
							strokeWeight: 2,
						},
						title: `Local: ${order.local || 'Sin local'}`,
					});

					const pickupInfoWindow = new google.maps.InfoWindow({
						content: `
							<div style="padding: 0.5rem;">
								<h3 style="margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600;">${order.local || 'Local'}</h3>
								<p style="margin: 0; font-size: 0.75rem; color: #6b7280;">Pedido: ${order.id}</p>
								<p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Cliente: ${order.clientName || 'Sin cliente'}</p>
							</div>
						`,
					});

					pickupMarker.addListener('click', () => {
						pickupInfoWindow.open(map, pickupMarker);
						if (onSelectOrder) {
							onSelectOrder(order);
						}
					});

					markersRef.current.push(pickupMarker);
				}

				// Marcador de delivery (entrega)
				if (coords.delivery) {
					const deliveryMarker = new google.maps.Marker({
						position: { lat: coords.delivery.lat, lng: coords.delivery.lon },
						map: map,
						icon: {
							path: google.maps.SymbolPath.CIRCLE,
							scale: 8,
							fillColor: '#10b981',
							fillOpacity: 1,
							strokeColor: '#ffffff',
							strokeWeight: 2,
						},
						title: `Entrega: ${order.clientName || 'Sin cliente'}`,
					});

					const deliveryInfoWindow = new google.maps.InfoWindow({
						content: `
							<div style="padding: 0.5rem;">
								<h3 style="margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600;">Entrega</h3>
								<p style="margin: 0; font-size: 0.75rem; color: #6b7280;">Pedido: ${order.id}</p>
								<p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Cliente: ${order.clientName || 'Sin cliente'}</p>
								<p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">Estado: ${order.status}</p>
							</div>
						`,
					});

					deliveryMarker.addListener('click', () => {
						deliveryInfoWindow.open(map, deliveryMarker);
						if (onSelectOrder) {
							onSelectOrder(order);
						}
					});

					markersRef.current.push(deliveryMarker);
				}

				// Cargar ubicación del repartidor si el pedido está asignado
				if (order.driverId && order.status !== 'Pendiente') {
					loadDriverLocation(order);
				}
			});
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [loading, activeOrders, onSelectOrder]);

	// Centrar mapa en repartidor
	const focusDriver = (driver) => {
		if (!mapInstanceRef.current || !driver.location) return;

		const position = {
			lat: driver.location.latitude,
			lng: driver.location.longitude,
		};

		mapInstanceRef.current.setCenter(position);
		mapInstanceRef.current.setZoom(15);

		// Abrir info window del marcador
		const marker = driverMarkersRef.current.get(driver.driverId);
		if (marker) {
			const infoWindow = new window.google.maps.InfoWindow({
				content: `
					<div style="padding: 0.5rem;">
						<h3 style="margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600;">${driver.driverName}</h3>
						<p style="margin: 0; font-size: 0.75rem; color: #6b7280;">${driver.orders.length} pedido${driver.orders.length !== 1 ? 's' : ''}</p>
					</div>
				`,
			});
			infoWindow.open(mapInstanceRef.current, marker);
		}

		setSelectedDriver(driver.driverId);
	};

	// Limpiar suscripciones al desmontar
	useEffect(() => {
		return () => {
			subscriptionsRef.current.forEach(unsubscribe => {
				if (unsubscribe) unsubscribe();
			});
			markersRef.current.forEach(marker => marker.setMap(null));
		};
	}, []);

	// Mostrar error si no hay API key
	if (!apiKey) {
		return (
			<div className="tracking-panel-error">
				<AlertCircle />
				<h3>API Key de Google Maps no configurada</h3>
				<p>Agrega VITE_API_KEY_MAPS en tu archivo .env</p>
			</div>
		);
	}

	// Mostrar loading solo mientras carga Google Maps API
	if (!mapLoaded) {
		return (
			<div className="tracking-panel-loading">
				<Navigation />
				<p>Cargando mapa...</p>
			</div>
		);
	}

	// Mostrar error
	if (error) {
		return (
			<div className="tracking-panel-error">
				<AlertCircle />
				<h3>{error}</h3>
			</div>
		);
	}

	// Mostrar mensaje si no hay pedidos activos
	if (activeOrders.length === 0) {
		return (
			<div className="tracking-panel-empty">
				<Package />
				<h3>No hay pedidos activos</h3>
				<p>Los pedidos activos aparecerán en el mapa</p>
			</div>
		);
	}

	return (
		<div className="tracking-panel">
			<div className="tracking-panel-header">
				<div className="tracking-panel-legend">
					<div className="tracking-legend-item">
						<div className="tracking-legend-marker tracking-legend-pickup"></div>
						<span>Local (Retiro)</span>
					</div>
					<div className="tracking-legend-item">
						<div className="tracking-legend-marker tracking-legend-delivery"></div>
						<span>Entrega</span>
					</div>
					<div className="tracking-legend-item">
						<div className="tracking-legend-marker tracking-legend-driver"></div>
						<span>Repartidor</span>
					</div>
				</div>
				<div className="tracking-panel-stats">
					<span>{activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} activo{activeOrders.length !== 1 ? 's' : ''}</span>
					{driversWithOrders.length > 0 && (
						<span className="tracking-panel-drivers-count">
							• {driversWithOrders.length} repartidor{driversWithOrders.length !== 1 ? 'es' : ''}
						</span>
					)}
				</div>
			</div>
			<div className="tracking-panel-content">
				{/* Panel lateral de repartidores */}
				{sidebarOpen && driversWithOrders.length > 0 && (
					<div className="tracking-sidebar">
						<div className="tracking-sidebar-header">
							<h3>Repartidores Activos</h3>
							<button 
								className="tracking-sidebar-close"
								onClick={() => setSidebarOpen(false)}
								aria-label="Cerrar panel"
							>
								<X size={18} />
							</button>
						</div>
						<div className="tracking-sidebar-content">
							{driversWithOrders.map((driver) => (
								<div
									key={driver.driverId}
									className={`tracking-driver-card ${selectedDriver === driver.driverId ? 'selected' : ''}`}
									onClick={() => focusDriver(driver)}
								>
									<div className="tracking-driver-header">
										<div className="tracking-driver-icon">
											<Bike size={20} />
										</div>
										<div className="tracking-driver-info">
											<h4 className="tracking-driver-name">{driver.driverName}</h4>
											<p className="tracking-driver-orders">
												{driver.orders.length} pedido{driver.orders.length !== 1 ? 's' : ''}
											</p>
										</div>
										{driver.location && (
											<div className="tracking-driver-status">
												<div className="tracking-driver-status-dot"></div>
											</div>
										)}
									</div>
									{driver.orders.length > 0 && (
										<div className="tracking-driver-orders-list">
											{driver.orders.map((order) => (
												<div key={order.id} className="tracking-driver-order-item">
													<span className="tracking-driver-order-id">{order.id}</span>
													<span className="tracking-driver-order-status">{order.status}</span>
												</div>
											))}
										</div>
									)}
									{driver.location && (
										<div className="tracking-driver-location">
											<MapPin size={14} />
											<span>En ruta</span>
										</div>
									)}
									{!driver.location && (
										<div className="tracking-driver-location offline">
											<Clock size={14} />
											<span>Sin ubicación</span>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Botón para abrir panel lateral */}
				{!sidebarOpen && driversWithOrders.length > 0 && (
					<button 
						className="tracking-sidebar-toggle"
						onClick={() => setSidebarOpen(true)}
						aria-label="Abrir panel de repartidores"
					>
						<Bike size={20} />
						<span>{driversWithOrders.length}</span>
					</button>
				)}

				{/* Mapa */}
				<div ref={mapRef} className={`tracking-panel-map ${sidebarOpen && driversWithOrders.length > 0 ? 'with-sidebar' : ''}`} />
			</div>
		</div>
	);
}

