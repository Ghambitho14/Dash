import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	// Para APK no necesitamos base path, solo para web
	// base: '/driver/',
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
	},
	// Optimizar dependencias para evitar problemas con imports dinámicos
	optimizeDeps: {
		exclude: ['@capacitor/core', '@capacitor/geolocation']
	},
	// Resolver imports dinámicos de Capacitor solo en runtime
	resolve: {
		alias: {
			// Permitir que los imports dinámicos se resuelvan en runtime
		}
	}
});

