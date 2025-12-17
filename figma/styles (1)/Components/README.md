# 📁 Estructura de Estilos - DeliveryApp

Esta carpeta contiene todos los archivos CSS organizados por componente y funcionalidad.

## 📂 Archivos

### `Variables.css`
Contiene todas las variables CSS globales utilizadas en la aplicación:
- Colores principales (azul, naranja, verde, rojo, púrpura)
- Colores neutros (grises)
- Sombras (xs, sm, md, lg, xl, 2xl)
- Espaciado
- Bordes y radios
- Transiciones
- Scrollbars personalizados

### `DeliveryLayout.css`
Define el layout principal de la aplicación:
- `.delivery-app` - Contenedor principal con fondo azul gradient
- `.delivery-container` - Contenedor flex para sidebar y main
- Media queries para responsive

### `DeliveryHeader.css`
Estilos del header superior:
- Logo con icono naranja
- Selector de locales con dropdown
- Información de usuario
- Botones de acción (notificaciones, configuración, logout)
- Efectos glassmorphism

### `DeliverySidebar.css`
Estilos de la barra lateral izquierda:
- Card de acciones rápidas
- Grid de botones de acción
- Cards de estadísticas con colores distintivos
- Indicadores de tendencia (positivo/negativo)
- Scrollbar personalizado

### `DeliveryMain.css`
Estilos del contenido principal:
- Header del panel con título y búsqueda
- Tabs para filtrar pedidos
- Contenedor de órdenes con grid
- Estado vacío
- Scrollbar personalizado

### `OrderCard.css`
Estilos de las tarjetas de pedidos:
- Header con ID y badge de estado
- Información del cliente con avatar
- Detalles de dirección
- Footer con tiempo y precio
- Estados: pending, in-progress, completed, cancelled
- Efectos hover y loading

## 🎨 Paleta de Colores

### Principales
- **Azul**: `#2563eb` (Primario), `#1e40af` (Oscuro), `#3b82f6` (Claro)
- **Naranja**: `#f59e0b` (Acciones, Logo)
- **Verde**: `#10b981` (Éxito, Completados)
- **Rojo**: `#ef4444` (Error, Cancelados)
- **Púrpura**: `#8b5cf6` (Acento)

### Neutros
- Grises del 50 al 900 para fondos, textos y bordes

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (diseño completo)
- **Tablet**: 768px - 1024px (sidebar reducido)
- **Mobile**: < 768px (layout vertical, sidebar al 100%)
- **Small Mobile**: < 480px (logo sin texto, grid reducido)

## 🔧 Uso

Importar en tu componente de la siguiente manera:

```tsx
import '../styles/Components/Variables.css';
import '../styles/Components/DeliveryLayout.css';
import '../styles/Components/DeliveryHeader.css';
import '../styles/Components/DeliverySidebar.css';
import '../styles/Components/DeliveryMain.css';
import '../styles/Components/OrderCard.css';
```

**Importante**: Importar `Variables.css` primero para que las variables CSS estén disponibles en todos los demás archivos.

## ✨ Características de Diseño

- **Glassmorphism**: Header con efecto de vidrio translúcido
- **Sombras suaves**: Cards elevados con sombras sutiles
- **Hover effects**: Transiciones suaves en todos los elementos interactivos
- **Scrollbars personalizados**: Para mejor experiencia de usuario
- **Badges de estado**: Con colores distintivos y opacidad del 10%
- **Gradiente azul**: Fondo principal coherente con el login
- **Responsive**: Adaptable a todos los tamaños de pantalla

## 🎯 Naming Convention

Todas las clases usan el prefijo `delivery-` seguido del nombre del componente o elemento:
- `.delivery-app`
- `.delivery-header`
- `.delivery-sidebar`
- `.delivery-stat-card`
- `.delivery-order-card`

Esto evita conflictos con otras librerías y mantiene el código organizado.
