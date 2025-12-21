import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, Package, CheckCircle2 } from 'lucide-react';
import { logger } from './logger';
import '../styles/utils/statusUtils.css';

// ============================================
// UTILIDADES DE FECHAS
// ============================================

// Formatear fecha completa
export function formatDate(date) {
	return new Date(date).toLocaleString('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

// Formatear tiempo relativo (hace X minutos, etc.)
export function formatRelativeTime(date, currentTime = new Date()) {
	const diff = currentTime.getTime() - new Date(date).getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return `Hace ${seconds} seg`;
	if (minutes < 60) {
		const remainingSeconds = seconds % 60;
		return remainingSeconds === 0 ? `Hace ${minutes} min` : `Hace ${minutes} min ${remainingSeconds} seg`;
	}
	if (hours < 24) {
		const remainingMinutes = minutes % 60;
		return remainingMinutes === 0 ? `Hace ${hours} h` : `Hace ${hours} h ${remainingMinutes} min`;
	}
	if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
	
	return new Date(date).toLocaleDateString('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}

// Hook para tiempo en tiempo real
export function useCurrentTime() {
	const [currentTime, setCurrentTime] = useState(new Date());
	
	useEffect(() => {
		const interval = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(interval);
	}, []);
	
	return currentTime;
}

// Obtener iniciales de un nombre
export function getInitials(name) {
	if (!name) return '??';
	return name
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

// ============================================
// UTILIDADES DE PRECIOS
// ============================================

// Formatear precio con formato chileno (punto para miles)
export function formatPrice(price) {
	const rounded = Math.round(price);
	return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ============================================
// UTILIDADES DE ESTADOS
// ============================================

// Obtener color CSS según estado
export function getStatusColor(status) {
	const colors = {
		'Pendiente': 'status-pendiente',
		'Asignado': 'status-asignado',
		'En camino al retiro': 'status-en-camino-al-retiro',
		'Producto retirado': 'status-producto-retirado',
		'Entregado': 'status-entregado',
	};
	return colors[status] || 'status-default';
}

// Obtener icono según estado
export function getStatusIcon(status) {
	const icons = {
		'Pendiente': Clock,
		'Asignado': CheckCircle,
		'En camino al retiro': Truck,
		'Producto retirado': Package,
		'Entregado': CheckCircle2,
	};
	return icons[status] || Clock;
}

// Obtener siguiente estado
export function getNextStatus(currentStatus) {
	const nextStatuses = {
		'Asignado': 'En camino al retiro',
		'En camino al retiro': 'Producto retirado',
		'Producto retirado': 'Entregado',
	};
	return nextStatuses[currentStatus] || null;
}

// ============================================
// UTILIDADES DE GEOLOCALIZACIÓN
// ============================================

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Radio de la Tierra en kilómetros
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Geocodifica una dirección usando Google Maps Geocoding API
 * Usa JavaScript API Geocoder si está disponible, sino usa REST API como fallback
 * @param {string} address - Dirección a geocodificar
 * @returns {Promise<{lat: number, lon: number} | null>} Coordenadas o null si falla
 */
export async function geocodeAddress(address) {
	if (!address || !address.trim()) {
		return null;
	}

	const apiKey = import.meta.env.VITE_API_KEY_MAPS;
	if (!apiKey) {
		logger.warn('VITE_API_KEY_MAPS no configurada, no se puede geocodificar');
		return null;
	}

	// Intentar usar JavaScript API Geocoder si está disponible
	if (window.google && window.google.maps && window.google.maps.Geocoder) {
		try {
			const geocoder = new window.google.maps.Geocoder();
			
			return new Promise((resolve) => {
				geocoder.geocode({ address: address }, (results, status) => {
					if (status === 'OK' && results && results.length > 0) {
						const location = results[0].geometry.location;
						resolve({
							lat: location.lat(),
							lon: location.lng()
						});
					} else {
						// Si falla con JS API, intentar con REST API
						geocodeAddressREST(address, apiKey).then(resolve);
					}
				});
			});
		} catch (error) {
			// Si hay error con JS API, usar REST API como fallback
			return geocodeAddressREST(address, apiKey);
		}
	}

	// Si JavaScript API no está disponible, usar REST API
	return geocodeAddressREST(address, apiKey);
}

/**
 * Geocodifica una dirección usando Google Maps Geocoding API REST
 * @param {string} address - Dirección a geocodificar
 * @param {string} apiKey - API Key de Google Maps
 * @returns {Promise<{lat: number, lon: number} | null>} Coordenadas o null si falla
 */
async function geocodeAddressREST(address, apiKey) {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
		);

		if (!response.ok) {
			throw new Error('Error en geocodificación');
		}

		const data = await response.json();
		
		if (data.status === 'OK' && data.results && data.results.length > 0) {
			const location = data.results[0].geometry.location;
			return {
				lat: parseFloat(location.lat),
				lon: parseFloat(location.lng)
			};
		}

		// Error silencioso para geocodificación (no crítico)
		return null;
	} catch (error) {
		// Error silencioso para geocodificación (no crítico)
		return null;
	}
}

/**
 * Verifica si Capacitor está disponible (solo en runtime)
 * @returns {Promise<{Geolocation: any, Capacitor: any} | null>}
 */
export async function getCapacitorModules() {
	// Solo intentar cargar Capacitor si estamos en un entorno que lo soporta
	// Verificar si window.Capacitor existe (se carga automáticamente en apps nativas)
	if (typeof window === 'undefined' || !window.Capacitor) {
		// No estamos en una app nativa, no intentar cargar Capacitor
		return null;
	}
	
	try {
		// Usar import dinámico con string literal para evitar análisis estático
		// Vite ignorará esto si el módulo no está disponible
		const geolocationModule = '@capacitor/geolocation';
		const coreModule = '@capacitor/core';
		
		const [geolocationImport, coreImport] = await Promise.all([
			import(/* @vite-ignore */ geolocationModule),
			import(/* @vite-ignore */ coreModule)
		]);
		
		return {
			Geolocation: geolocationImport.Geolocation,
			Capacitor: coreImport.Capacitor
		};
	} catch (err) {
		// Capacitor no está disponible (estamos en web o módulos no instalados)
		return null;
	}
}

/**
 * Obtiene la ubicación GPS actual del usuario
 * Usa Capacitor Geolocation en móvil, fallback a Web API en navegador
 * @returns {Promise<{lat: number, lon: number} | null>} Coordenadas o null si falla
 */
export async function getCurrentLocation() {
	// Intentar usar Capacitor si está disponible
	const capacitorModules = await getCapacitorModules();
	
	if (capacitorModules) {
		const { Geolocation, Capacitor } = capacitorModules;
		
		try {
			if (Capacitor.isNativePlatform()) {
				// Verificar permisos primero
				const permissionStatus = await Geolocation.checkPermissions();
				
				if (permissionStatus.location !== 'granted') {
					// Solicitar permisos
					const requestResult = await Geolocation.requestPermissions();
					if (requestResult.location !== 'granted') {
						return null;
					}
				}
				
				// Obtener ubicación con Capacitor
				try {
					const position = await Geolocation.getCurrentPosition({
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 0
					});
					
					return {
						lat: position.coords.latitude,
						lon: position.coords.longitude
					};
				} catch (positionErr) {
					// Si el usuario canceló el diálogo de permisos, no es un error crítico
					const errorMessage = positionErr?.message || '';
					if (errorMessage.includes('cancelled') || errorMessage.includes('PHASE_CLIENT_ALREADY_HIDDEN')) {
						logger.warn('⚠️ Usuario canceló el diálogo de permisos de ubicación');
						return null; // Retornar null silenciosamente
					}
					// Para otros errores, continuar con Web API
					logger.warn('⚠️ Error obteniendo ubicación con Capacitor, intentando Web API:', positionErr?.message);
				}
			}
		} catch (err) {
			// Si falla Capacitor completamente, continuar con Web API
			const errorMessage = err?.message || '';
			if (!errorMessage.includes('cancelled') && !errorMessage.includes('PHASE_CLIENT_ALREADY_HIDDEN')) {
				logger.warn('⚠️ Error con Capacitor Geolocation, usando Web API:', err?.message);
			}
		}
	}
	
	// Fallback a Web Geolocation API (navegador)
	return new Promise((resolve) => {
		if (!navigator.geolocation) {
			resolve(null);
			return;
		}

		// Intentar obtener ubicación con reintentos
		let attempts = 0;
		const maxAttempts = 2;
		
		const tryGetPosition = () => {
			attempts++;
			
			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lon: position.coords.longitude
					});
				},
				(error) => {
					// Si es timeout y aún hay intentos, reintentar
					if (error.code === 3 && attempts < maxAttempts) {
						logger.warn(`⚠️ Timeout obteniendo ubicación (intento ${attempts}), reintentando...`);
						setTimeout(() => {
							tryGetPosition();
						}, 2000);
					} else {
						// Error silencioso para ubicación GPS (no crítico)
						logger.warn('⚠️ No se pudo obtener ubicación:', error.code === 3 ? 'Timeout' : error.message);
						resolve(null);
					}
				},
				{
					enableHighAccuracy: true,
					timeout: 20000, // Aumentado a 20 segundos
					maximumAge: 60000 // Aceptar ubicaciones de hasta 1 minuto de antigüedad
				}
			);
		};
		
		tryGetPosition();
	});
}

