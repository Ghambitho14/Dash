import { useState, useEffect } from 'react';

// Utilidad para formatear fechas relativas
export function formatRelativeTime(date: Date, currentTime: Date = new Date()): string {
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

// Formatear fecha completa
export function formatDate(date: Date): string {
	return new Date(date).toLocaleString('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}
