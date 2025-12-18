import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, Package, CheckCircle2 } from 'lucide-react';
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
 * Geocodifica una dirección usando Nominatim (OpenStreetMap)
 * @param {string} address - Dirección a geocodificar
 * @returns {Promise<{lat: number, lon: number} | null>} Coordenadas o null si falla
 */
export async function geocodeAddress(address) {
	if (!address || !address.trim()) {
		return null;
	}

	try {
		// Usar Nominatim (OpenStreetMap) - gratuito, sin API key
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
			{
				headers: {
					'User-Agent': 'DeliveryApp/1.0' // Requerido por Nominatim
				}
			}
		);

		if (!response.ok) {
			throw new Error('Error en geocodificación');
		}

		const data = await response.json();
		
		if (data && data.length > 0) {
			return {
				lat: parseFloat(data[0].lat),
				lon: parseFloat(data[0].lon)
			};
		}

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
async function getCapacitorModules() {
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
				const position = await Geolocation.getCurrentPosition({
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				});
				
				return {
					lat: position.coords.latitude,
					lon: position.coords.longitude
				};
			}
		} catch (err) {
			// Si falla Capacitor, continuar con Web API
		}
	}
	
	// Fallback a Web Geolocation API (navegador)
	return new Promise((resolve) => {
		if (!navigator.geolocation) {
			resolve(null);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					lat: position.coords.latitude,
					lon: position.coords.longitude
				});
			},
			(error) => {
				// Error silencioso para ubicación GPS (no crítico)
				resolve(null);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			}
		);
	});
}

