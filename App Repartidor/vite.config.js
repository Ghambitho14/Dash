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
});

