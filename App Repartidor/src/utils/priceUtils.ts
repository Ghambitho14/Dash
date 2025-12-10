/**
 * Formatea un precio como número con formato chileno
 * Punto para separar miles, sin decimales
 * Ejemplo: 2000 -> "2.000"
 */
export function formatPrice(price: number): string {
	// Redondeamos a número entero
	const rounded = Math.round(price);
	
	// Formateamos con punto como separador de miles (formato chileno)
	return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

