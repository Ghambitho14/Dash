import { useEffect, useState, useRef } from 'react';
import { geocodeAddress } from '../../utils/utils';
import { logger } from '../../utils/logger';
import '../../styles/Components/SimpleMap.css';

export function SimpleMap({ address, label }) {
	const [coords, setCoords] = useState(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [loading, setLoading] = useState(true);
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markerRef = useRef(null);

	const apiKey = import.meta.env.VITE_API_KEY_MAPS;

	// Cargar script de Google Maps
	useEffect(() => {
		if (!apiKey) {
			logger.error('❌ VITE_API_KEY_MAPS no está configurada en .env');
			setLoading(false);
			return;
		}

		// Verificar si ya está cargado
		if (window.google && window.google.maps) {
			logger.log('✅ Google Maps ya está cargado');
			setMapLoaded(true);
			return;
		}

		// Verificar si el script ya existe
		const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
		if (existingScript) {
			logger.log('📜 Script de Google Maps ya existe, esperando carga...');
			existingScript.addEventListener('load', () => {
				logger.log('✅ Script cargado desde elemento existente');
				setMapLoaded(true);
			});
			if (window.google && window.google.maps) {
				setMapLoaded(true);
			}
			return;
		}

		logger.log('📥 Cargando script de Google Maps...');
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
		script.async = true;
		script.defer = true;
		script.onload = () => {
			logger.log('✅ Google Maps API cargada correctamente');
			setMapLoaded(true);
		};
		script.onerror = (error) => {
			logger.error('❌ Error cargando Google Maps API:', error);
			setLoading(false);
		};
		document.head.appendChild(script);
	}, [apiKey]);

	// Geocodificar dirección
	useEffect(() => {
		const loadAddress = async () => {
			if (!address) {
				setLoading(false);
				return;
			}

			setLoading(true);
			const addressCoords = await geocodeAddress(address);
			setCoords(addressCoords);
			setLoading(false);
		};

		loadAddress();
	}, [address]);

	// Inicializar mapa cuando esté listo
	useEffect(() => {
		if (!mapLoaded || !window.google || !mapRef.current || !coords) {
			return;
		}

		const timeoutId = setTimeout(() => {
			const google = window.google;

			// Crear mapa
			const map = new google.maps.Map(mapRef.current, {
				zoom: 15,
				center: { lat: coords.lat, lng: coords.lon },
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

			mapInstanceRef.current = map;

			// Limpiar marcador anterior
			if (markerRef.current) {
				markerRef.current.setMap(null);
			}

			// Crear marcador
			markerRef.current = new google.maps.Marker({
				position: { lat: coords.lat, lng: coords.lon },
				map: map,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 8,
					fillColor: '#3b82f6',
					fillOpacity: 1,
					strokeColor: '#ffffff',
					strokeWeight: 2,
				},
				title: label || address,
			});

			setLoading(false);
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [mapLoaded, coords, address, label]);

	if (loading) {
		return (
			<div className="simple-map-container">
				{label && <p className="simple-map-label">{label}</p>}
				<div className="simple-map-loading">
					<p>Cargando mapa...</p>
				</div>
			</div>
		);
	}

	if (!coords) {
		return (
			<div className="simple-map-container">
				{label && <p className="simple-map-label">{label}</p>}
				<div className="simple-map-error">
					<p>No se pudo cargar la ubicación</p>
				</div>
			</div>
		);
	}

	return (
		<div className="simple-map-container">
			{label && <p className="simple-map-label">{label}</p>}
			<div className="simple-map" ref={mapRef} />
		</div>
	);
}

