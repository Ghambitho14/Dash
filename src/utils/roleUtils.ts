import { UserRole } from '../types/user';

/**
 * Verifica si un usuario tiene permisos de administrador o CEO
 * @param role - Rol del usuario
 * @returns true si el usuario es admin o empresarial
 */
export function isAdminOrEmpresarial(role: UserRole): boolean {
	return role === 'admin' || role === 'empresarial';
}

/**
 * Obtiene el nombre legible del rol
 * @param role - Rol del usuario
 * @returns Nombre legible del rol
 */
export function getRoleName(role: UserRole): string {
	switch (role) {
		case 'empresarial':
			return 'CEO';
		case 'admin':
			return 'Administrador';
		case 'local':
			return 'Local';
		default:
			return role;
	}
}

