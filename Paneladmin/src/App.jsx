import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import './style/App.css';

function App() {
	const [admin, setAdmin] = useState(null);

	const handleLogin = (adminData) => {
		setAdmin(adminData);
	};

	const handleLogout = () => {
		setAdmin(null);
	};

	return (
		<div className="app">
			{admin ? (
				<Dashboard admin={admin} onLogout={handleLogout} />
			) : (
				<Login onLogin={handleLogin} />
			)}
		</div>
	);
}

export default App;
