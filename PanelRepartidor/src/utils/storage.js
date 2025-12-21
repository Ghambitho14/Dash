/**
 * Utilidad de almacenamiento que usa Capacitor Preferences en apps nativas
 * y localStorage como fallback en web
 */

let Capacitor = null;
let Preferences = null;

// Intentar cargar Capacitor solo si está disponible
const initCapacitor = async () => {
	if (typeof window === 'undefined') return;
	
	// Si ya está inicializado, no hacer nada
	if (Capacitor && Preferences) return;
	
	// Verificar si estamos en web (navegador) antes de intentar importar
	// En web, Capacitor no estará disponible y no debemos intentar importarlo
	const isWeb = !window.Capacitor || 
		(window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'web') ||
		!window.Capacitor.isNativePlatform?.();
	
	if (isWeb) {
		Capacitor = null;
		Preferences = null;
		return;
	}
	
	// Solo intentar importar si estamos en una plataforma nativa
	// En apps nativas de Capacitor, window.Capacitor ya está disponible globalmente
	// Solo necesitamos importar los módulos específicos
	try {
		// Usar una función que construya el import dinámicamente
		// Esto ayuda a evitar que Vite analice el import estáticamente
		const loadModule = async (moduleName) => {
			// Construir el path del módulo dinámicamente
			const parts = moduleName.split('/');
			const fullPath = parts.join('/');
			// Usar import dinámico con el path construido
			return await import(/* @vite-ignore */ fullPath);
		};
		
		const capacitorCore = await loadModule('@capacitor/core');
		const capacitorPreferences = await loadModule('@capacitor/preferences');
		
		Capacitor = capacitorCore.Capacitor;
		Preferences = capacitorPreferences.Preferences;
	} catch (err) {
		// Capacitor no está disponible (error de import o estamos en web)
		// Esto es normal en web, simplemente usar localStorage
		Capacitor = null;
		Preferences = null;
	}
};

/**
 * Verifica si estamos en una plataforma nativa
 */
const isNativePlatform = () => {
	if (typeof window === 'undefined') return false;
	
	// Si Capacitor ya está cargado, usar su método
	if (Capacitor) {
		return Capacitor.isNativePlatform();
	}
	
	// Verificar si window.Capacitor existe (se carga automáticamente en apps nativas)
	return !!(window.Capacitor && window.Capacitor.isNativePlatform?.());
};

/**
 * Guarda un valor en el almacenamiento
 * @param {string} key - Clave
 * @param {string} value - Valor (debe ser string)
 */
export const setStorageItem = async (key, value) => {
	await initCapacitor();
	
	if (isNativePlatform() && Preferences) {
		// Usar Capacitor Preferences en apps nativas
		try {
			await Preferences.set({ key, value });
		} catch (err) {
			console.error('Error guardando en Preferences:', err);
			// Fallback a localStorage
			localStorage.setItem(key, value);
		}
	} else {
		// Usar localStorage en web
		localStorage.setItem(key, value);
	}
};

/**
 * Obtiene un valor del almacenamiento
 * @param {string} key - Clave
 * @returns {Promise<string|null>} Valor o null si no existe
 */
export const getStorageItem = async (key) => {
	await initCapacitor();
	
	if (isNativePlatform() && Preferences) {
		// Usar Capacitor Preferences en apps nativas
		try {
			const result = await Preferences.get({ key });
			return result.value;
		} catch (err) {
			console.error('Error leyendo de Preferences:', err);
			// Fallback a localStorage
			return localStorage.getItem(key);
		}
	} else {
		// Usar localStorage en web
		return localStorage.getItem(key);
	}
};

/**
 * Elimina un valor del almacenamiento
 * @param {string} key - Clave
 */
export const removeStorageItem = async (key) => {
	await initCapacitor();
	
	if (isNativePlatform() && Preferences) {
		// Usar Capacitor Preferences en apps nativas
		try {
			await Preferences.remove({ key });
		} catch (err) {
			console.error('Error eliminando de Preferences:', err);
			// Fallback a localStorage
			localStorage.removeItem(key);
		}
	} else {
		// Usar localStorage en web
		localStorage.removeItem(key);
	}
};

/**
 * Guarda un objeto JSON en el almacenamiento
 * @param {string} key - Clave
 * @param {object} value - Objeto a guardar
 */
export const setStorageObject = async (key, value) => {
	const jsonString = JSON.stringify(value);
	await setStorageItem(key, jsonString);
};

/**
 * Obtiene un objeto JSON del almacenamiento
 * @param {string} key - Clave
 * @returns {Promise<object|null>} Objeto o null si no existe
 */
export const getStorageObject = async (key) => {
	const jsonString = await getStorageItem(key);
	if (!jsonString) return null;
	
	try {
		return JSON.parse(jsonString);
	} catch (err) {
		console.error('Error parseando JSON del storage:', err);
		return null;
	}
};

