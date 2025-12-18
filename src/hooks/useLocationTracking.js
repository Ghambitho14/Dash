import { useEffect, useRef } from 'react';
import { saveDriverLocation } from '../services/locationService';
import { logger } from '../utils/logger';

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
 * Hook para trackear la ubicación GPS del repartidor
 * Usa Capacitor Geolocation en móvil, fallback a Web API en navegador
 */
export function useLocationTracking(driverId, orderId = null, enabled = true) {
	const watchIdRef = useRef(null);
	const lastUpdateRef = useRef(0);
	const isNativeRef = useRef(null); // null = no verificado, true/false = resultado
	const UPDATE_INTERVAL = 10000; // Actualizar cada 10 segundos

	useEffect(() => {
		if (!enabled || !driverId) {
			return;
		}

		let cleanup = () => {};

		const initTracking = async () => {
			// Intentar usar Capacitor si está disponible
			const capacitorModules = await getCapacitorModules();
			
			if (capacitorModules) {
				const { Geolocation, Capacitor } = capacitorModules;
				
				try {
					if (Capacitor.isNativePlatform()) {
						isNativeRef.current = true;
						
						// Verificar permisos primero
						let permissionStatus = await Geolocation.checkPermissions();
						
						if (permissionStatus.location !== 'granted') {
							// Solicitar permisos
							permissionStatus = await Geolocation.requestPermissions();
							if (permissionStatus.location !== 'granted') {
								logger.error('Permisos de ubicación denegados');
								return;
							}
						}
						
						// Obtener ubicación inicial
						try {
							const initialPosition = await Geolocation.getCurrentPosition({
								enableHighAccuracy: true,
								timeout: 5000,
								maximumAge: 0
							});
							
							const now = Date.now();
							if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
								lastUpdateRef.current = now;
								saveDriverLocation(
									driverId,
									initialPosition.coords.latitude,
									initialPosition.coords.longitude,
									orderId
								).catch(err => logger.error('Error guardando ubicación:', err));
							}
						} catch (err) {
							logger.error('Error obteniendo ubicación inicial:', err);
						}
						
						// Iniciar seguimiento continuo con Capacitor
						const watchId = await Geolocation.watchPosition(
							{
								enableHighAccuracy: true,
								timeout: 5000,
								maximumAge: 0
							},
							(position, err) => {
								if (err) {
									logger.error('Error en watchPosition:', err);
									return;
								}
								
								const now = Date.now();
								// Solo actualizar si ha pasado el intervalo
								if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
									return;
								}
								
								const { latitude, longitude } = position.coords;
								lastUpdateRef.current = now;
								
								// Guardar ubicación en Supabase
								saveDriverLocation(driverId, latitude, longitude, orderId)
									.catch(err => {
										logger.error('Error guardando ubicación:', err);
									});
							}
						);
						
						watchIdRef.current = watchId;
						
						// Cleanup para Capacitor
						cleanup = async () => {
							if (watchIdRef.current !== null) {
								try {
									await Geolocation.clearWatch({ id: watchIdRef.current });
								} catch (err) {
									logger.error('Error limpiando watchPosition:', err);
								}
								watchIdRef.current = null;
							}
						};
						
						return;
					}
				} catch (err) {
					// Si falla Capacitor, continuar con Web API
					logger.log('Error usando Capacitor, usando Web Geolocation API');
				}
			}
			
			// Fallback a Web Geolocation API (navegador)
			isNativeRef.current = false;
			
			if (!navigator.geolocation) {
				logger.error('Geolocalización no disponible');
				return;
			}
			
			const updateLocation = (position) => {
				const now = Date.now();
				// Solo actualizar si ha pasado el intervalo
				if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
					return;
				}
				
				const { latitude, longitude } = position.coords;
				lastUpdateRef.current = now;
				
				// Guardar ubicación en Supabase
				saveDriverLocation(driverId, latitude, longitude, orderId)
					.catch(err => {
						logger.error('Error guardando ubicación:', err);
					});
			};
			
			const handleError = (error) => {
				logger.error('Error obteniendo ubicación:', error);
			};
			
			// Opciones para geolocalización
			const options = {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			};
			
			// Obtener ubicación inicial
			navigator.geolocation.getCurrentPosition(updateLocation, handleError, options);
			
			// Iniciar seguimiento continuo
			watchIdRef.current = navigator.geolocation.watchPosition(
				updateLocation,
				handleError,
				options
			);
			
			// Cleanup para Web API
			cleanup = () => {
				if (watchIdRef.current !== null) {
					navigator.geolocation.clearWatch(watchIdRef.current);
					watchIdRef.current = null;
				}
			};
		};
		
		initTracking();
		
		// Limpiar al desmontar
		return () => {
			cleanup();
		};
	}, [driverId, orderId, enabled]);
}

