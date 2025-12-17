import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, Package, CheckCircle2 } from 'lucide-react';

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
// UTILIDADES DE CÓDIGOS
// ============================================

// Generar código de retiro de 6 dígitos
export function generatePickupCode() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// UTILIDADES DE ESTADOS
// ============================================


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


// Formatear estado para vista de empresa
export function formatStatusForCompany(status) {
	if (status === 'Producto retirado') {
		return 'Producto retirado, en camino';
	}
	return status;
}

// ============================================
// UTILIDADES DE ROLES
// ============================================

// Verificar si es admin o CEO
export function isAdminOrEmpresarial(role) {
	return role === 'admin' || role === 'empresarial';
}

// Obtener nombre legible del rol
export function getRoleName(role) {
	const names = {
		'empresarial': 'CEO',
		'admin': 'Administrador',
		'local': 'Local',
	};
	return names[role] || role;
}

// ============================================
// UTILIDADES DE LOCALES
// ============================================

// Obtener dirección de un local
export function getLocalAddress(localName, localConfigs) {
	const local = localConfigs.find(l => l.name === localName);
	return local?.address || '';
}

