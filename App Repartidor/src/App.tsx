import { useState, useEffect } from 'react';
import { DriverApp } from './components/DriverApp';
import { Login } from './components/Login';
import { DriverLayout } from './layouts/DriverLayout';
import { Driver } from './types/driver';
import { Order } from './types/order';
import { mockOrders } from './utils/mockData';

export default function App() {
	const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
	const [orders, setOrders] = useState<Order[]>([]);
	const [driverActiveView, setDriverActiveView] = useState<'orders' | 'profile' | 'wallet' | 'settings'>('orders');

	useEffect(() => {
		// Cargar pedidos mock al iniciar
		setOrders(mockOrders);
		// Cargar driver desde localStorage si existe
		const savedDriver = localStorage.getItem('driver');
		if (savedDriver) {
			try {
				setCurrentDriver(JSON.parse(savedDriver));
			} catch (e) {
				console.error('Error loading driver:', e);
			}
		}
	}, []);

	const handleLogin = (driver: Driver) => {
		setCurrentDriver(driver);
		// Guardar driver en localStorage
		localStorage.setItem('driver', JSON.stringify(driver));
	};

	const handleLogout = () => {
		setCurrentDriver(null);
		localStorage.removeItem('driver');
	};

	// Si no hay driver logueado, mostrar login
	if (!currentDriver) {
		return <Login onLogin={handleLogin} />;
	}

	return (
		<DriverLayout 
			driverName={currentDriver.name}
			activeView={driverActiveView}
			onViewChange={setDriverActiveView}
			onLogout={handleLogout}
		>
			<DriverApp 
				orders={orders} 
				setOrders={setOrders}
				activeView={driverActiveView}
				onViewChange={setDriverActiveView}
			/>
		</DriverLayout>
	);
}
