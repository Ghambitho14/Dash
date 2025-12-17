# 📁 Componentes - DeliveryApp

Esta carpeta contiene todos los componentes React organizados de forma modular.

## 📂 Estructura de Archivos

```
/components/Delivery/
├── DeliveryApp.tsx      # Componente principal (contenedor)
├── Header.tsx           # Header con logo, selector de locales y usuario
├── Sidebar.tsx          # Barra lateral con acciones y estadísticas
├── MainContent.tsx      # Contenido principal con búsqueda y pedidos
├── OrderCard.tsx        # Tarjeta individual de pedido
├── QuickActions.tsx     # Card de acciones rápidas
├── StatsGrid.tsx        # Grid de estadísticas
├── types.ts             # Interfaces y tipos TypeScript
├── utils.ts             # Funciones utilitarias
├── mockData.ts          # Datos de prueba
├── index.ts             # Barrel export
└── README.md            # Esta documentación
```

## 🧩 Componentes

### `DeliveryApp.tsx` (Componente Principal)
- **Descripción**: Contenedor principal que maneja el estado global
- **Estado**: 
  - `currentUser`: Usuario actual
  - `selectedLocal`: Local seleccionado
  - `showLocalDropdown`: Estado del dropdown
  - `activeTab`: Tab activo (all/active/completed)
  - `searchTerm`: Término de búsqueda
- **Lógica**: Filtrado de órdenes, cálculo de estadísticas
- **Renderiza**: Header, Sidebar, MainContent

### `Header.tsx`
- **Descripción**: Barra superior con navegación
- **Props**: 
  - `currentUser`: Información del usuario
  - `selectedLocal`: Local seleccionado
  - `showLocalDropdown`: Estado del dropdown
  - `locales`: Lista de locales
  - `isAdmin`: Si el usuario es admin
  - `onLocalSelect`: Callback para seleccionar local
  - `onToggleDropdown`: Callback para toggle del dropdown
- **Características**:
  - Logo con icono naranja
  - Selector de locales (solo admin)
  - Avatar y nombre de usuario
  - Botones de notificaciones, configuración y logout

### `Sidebar.tsx`
- **Descripción**: Barra lateral izquierda
- **Props**:
  - `isAdmin`: Si el usuario es admin
  - `stats`: Objeto con estadísticas
- **Renderiza**:
  - QuickActions
  - StatsGrid

### `QuickActions.tsx`
- **Descripción**: Card con botones de acción rápida
- **Props**:
  - `isAdmin`: Si el usuario es admin
- **Acciones**:
  - Nuevo Pedido (siempre visible)
  - Clientes (siempre visible)
  - Usuarios (solo admin)
  - Configurar (solo admin)

### `StatsGrid.tsx`
- **Descripción**: Grid con estadísticas
- **Props**:
  - `stats`: Objeto con estadísticas
- **Muestra**:
  - Total de Pedidos (azul)
  - Pendientes (naranja)
  - En Progreso (azul)
  - Completados (verde)
- **Características**:
  - Iconos
  - Valores numéricos
  - Tendencias (+/-)

### `MainContent.tsx`
- **Descripción**: Contenido principal con pedidos
- **Props**:
  - `activeTab`: Tab activo
  - `searchTerm`: Término de búsqueda
  - `stats`: Estadísticas
  - `filteredOrders`: Órdenes filtradas
  - `onTabChange`: Callback para cambio de tab
  - `onSearchChange`: Callback para búsqueda
- **Características**:
  - Título
  - Barra de búsqueda
  - Tabs de filtrado
  - Grid de OrderCards

### `OrderCard.tsx`
- **Descripción**: Tarjeta de pedido individual
- **Props**:
  - `order`: Objeto Order
- **Muestra**:
  - ID del pedido
  - Badge de estado
  - Avatar y nombre del cliente
  - Teléfono del cliente
  - Direcciones de recogida y entrega
  - Hora de creación
  - Precio

## 📄 Archivos Auxiliares

### `types.ts`
Define las interfaces TypeScript:
- `User`: Usuario del sistema
- `Order`: Pedido/orden
- `Stats`: Estadísticas
- `TabType`: Tipo de tab ('all' | 'active' | 'completed')

### `utils.ts`
Funciones utilitarias:
- `getStatusText()`: Traduce el estado al español
- `getInitials()`: Obtiene las iniciales de un nombre
- `getRoleText()`: Traduce el rol al español

### `mockData.ts`
Datos de prueba:
- `mockOrders`: Array con 6 pedidos de ejemplo

### `index.ts`
Barrel export para importaciones limpias:
```tsx
import { DeliveryApp } from './components/Delivery';
```

## 🔄 Flujo de Datos

```
DeliveryApp (estado)
    ├── Header (props)
    ├── Sidebar (props)
    │   ├── QuickActions (props)
    │   └── StatsGrid (props)
    └── MainContent (props)
        └── OrderCard (props) [x N]
```

## 💡 Uso

### Importación Simple
```tsx
import { DeliveryApp } from './components/Delivery';
```

### Importación de Componentes Individuales
```tsx
import { Header, Sidebar, MainContent } from './components/Delivery';
```

### Importación de Tipos
```tsx
import { User, Order, Stats } from './components/Delivery';
```

## 🎯 Ventajas de esta Estructura

✅ **Modularidad**: Cada componente tiene una responsabilidad única  
✅ **Reusabilidad**: Componentes independientes y reutilizables  
✅ **Mantenibilidad**: Fácil localizar y modificar código  
✅ **Testeable**: Componentes pequeños fáciles de testear  
✅ **Escalable**: Fácil agregar nuevos componentes  
✅ **TypeScript**: Tipos e interfaces centralizados  
✅ **Clean Code**: Separación de lógica, utilidades y datos
