/**
 * Genera un código aleatorio de 6 dígitos para el retiro de productos
 * @returns Código de 6 dígitos como string
 */
export function generatePickupCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

