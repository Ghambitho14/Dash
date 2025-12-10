# Arquitectura del Proyecto - Sistema de Delivery

Este documento describe la estructura y funcionalidad de cada archivo en el proyecto.

## 📁 Estructura General

El proyecto está dividido en dos aplicaciones separadas:
- **Proyecto Principal** (`src/`): Aplicación para la empresa/administradores
- **App Repartidor** (`App Repartidor/src/`): Aplicación para los repartidores

---

## 🏢 Proyecto Principal (Empresa)

### 📂 `src/`

#### `App.tsx`
**Función**: Componente raíz de la aplicación de empresa.
- Gestiona el estado global (usuarios, pedidos, clientes, locales)
- Maneja la autenticación y renderiza `Login` o `CompanyLayout`
- Persiste datos en `localStorage` (pedidos, clientes, configuración de locales)
- Coordina la comunicación entre componentes principales

#### `main.tsx`
**Función**: Punto de entrada de la aplicación React.
- Inicializa React DOM
- Importa estilos globales y utilidades

---

### 📂 `src/types/`

#### `order.ts`
**Función**: Define tipos TypeScript relacionados con pedidos.
- `OrderStatus`: Estados posibles de un pedido (Pendiente, Asignado, En camino al retiro, Producto retirado, Entregado)
- `Local`: Tipos de locales disponibles
- `Order`: Interfaz completa de un pedido (id, cliente, direcciones, precio, estado, código de retiro, etc.)

#### `user.ts`
**Función**: Define tipos y datos mock de usuarios.
- `UserRole`: Roles disponibles (admin, local, superadmin)
- `User`: Interfaz de usuario con credenciales y permisos
- `mockUsers`: Usuarios de prueba para desarrollo

#### `client.ts`
**Función**: Define tipos relacionados con clientes.
- `Client`: Interfaz de cliente (id, nombre, teléfono, dirección, local asignado, fechas)

---

### 📂 `src/utils/`

#### `codeUtils.ts`
**Función**: Genera códigos de retiro para pedidos.
- `generatePickupCode()`: Genera un código numérico de 6 dígitos único para cada pedido

#### `dateUtils.ts`
**Función**: Utilidades para formateo y manejo de fechas.
- `formatDate()`: Formatea fechas en formato legible
- `formatRelativeTime()`: Muestra tiempo relativo (hace X minutos/horas)
- `useCurrentTime()`: Hook que actualiza el tiempo actual cada minuto

#### `priceUtils.ts`
**Función**: Utilidades para formateo de precios.
- `formatPrice()`: Formatea números como moneda chilena (CLP)

#### `statusUtils.ts`
**Función**: Lógica de estados de pedidos.
- `getStatusColor()`: Retorna el color CSS según el estado
- `getStatusIcon()`: Retorna el icono correspondiente al estado
- `getNextStatus()`: Determina el siguiente estado válido en el flujo
- `formatStatusForCompany()`: Formatea el estado para mostrar en la vista de empresa (ej: "Producto retirado, en camino")

#### `localConfig.ts`
**Función**: Configuración de locales.
- `LocalConfig`: Interfaz de configuración de local (nombre, dirección)
- `defaultLocalConfigs`: Configuración inicial de locales
- `getLocalAddress()`: Obtiene la dirección de un local por su nombre

#### `mockData.ts`
**Función**: Datos de prueba para desarrollo.
- `mockOrders`: Array de pedidos de ejemplo

---

### 📂 `src/components/`

#### `Login.tsx`
**Función**: Componente de autenticación.
- Formulario de login (usuario y contraseña)
- Valida credenciales contra `mockUsers`
- Botones de acceso rápido para desarrollo
- Maneja errores de autenticación

#### `CompanyPanel.tsx`
**Función**: Panel principal de gestión de pedidos.
- Sidebar con estadísticas, acciones y filtros
- Lista de pedidos con filtros por estado y local
- Gestión de modales (crear pedido, configurar clientes, configurar locales)
- Filtrado de pedidos según rol del usuario (admin ve todos, local ve solo los suyos)

#### `CreateOrderForm.tsx`
**Función**: Formulario para crear nuevos pedidos.
- Campos: nombre del cliente (con búsqueda), dirección de retiro, dirección de entrega, local, precio sugerido, notas
- Búsqueda y selección de clientes existentes
- Auto-completado de dirección al seleccionar cliente
- Validación de campos requeridos

#### `CreateClientForm.tsx`
**Función**: Formulario para crear/editar clientes.
- Campos: nombre, teléfono, dirección, local asignado
- Modo creación y edición
- Validación de formato de teléfono
- Selector de local (filtrado según rol del usuario)

#### `ClientManagement.tsx`
**Función**: Gestión completa de clientes.
- Lista todos los clientes (filtrados por local si es usuario local)
- Botones para agregar, editar y eliminar clientes
- Integra `CreateClientForm` para creación/edición
- Muestra información completa de cada cliente

#### `LocalSettings.tsx`
**Función**: Configuración de locales (solo para admin).
- Lista de locales configurados
- Permite agregar, editar y eliminar locales
- Guarda configuración en `localStorage`

#### `OrderList.tsx`
**Función**: Componente que renderiza la lista de pedidos.
- Recibe array de pedidos y funciones de callback
- Muestra estado vacío si no hay pedidos
- Renderiza `OrderCard` para cada pedido

#### `OrderCard.tsx` (en `company/`)
**Función**: Tarjeta individual de pedido para la vista de empresa.
- Muestra información resumida: ID, cliente, direcciones, precio, estado, código de retiro
- Botón para eliminar pedido
- Click para ver detalles completos
- Formatea estado con colores e iconos

#### `OrderDetail.tsx` (en `company/`)
**Función**: Vista detallada de un pedido (modal).
- Muestra toda la información del pedido
- Incluye código de retiro destacado
- Botones de acción (cerrar, eliminar)
- Diseño responsive

#### `Modal.tsx` (en `common/`)
**Función**: Componente modal reutilizable.
- Overlay con blur
- Contenido centrado con animaciones
- Tamaños configurables (sm, md, lg, xl, 2xl)
- Responsive (se adapta a móvil)

---

### 📂 `src/layouts/`

#### `CompanyLayout.tsx`
**Función**: Layout principal de la aplicación de empresa.
- Header fijo con título, nombre de usuario y botón de logout
- Contenedor para el contenido principal
- Diseño responsive

---

### 📂 `src/styles/`

#### Organización de Estilos

Todos los estilos están organizados en la carpeta `styles/` siguiendo la misma estructura que los componentes:

- **`styles/Components/`**: Estilos de componentes
  - `company/`: Estilos de componentes específicos de empresa (OrderCard, OrderDetail)
  - `common/`: Estilos de componentes compartidos (Modal)
  - Archivos directos: Estilos de componentes principales (CompanyPanel, CreateOrderForm, etc.)

- **`styles/layouts/`**: Estilos de layouts (CompanyLayout)

- **`styles/utils/`**: Estilos de utilidades (statusUtils - clases de estado)

- **`globals.css`**: Estilos globales de la aplicación

---

## 🚗 App Repartidor

### 📂 `App Repartidor/src/`

#### `App.tsx`
**Función**: Componente raíz de la aplicación de repartidor.
- Gestiona el estado del repartidor autenticado
- Maneja la autenticación y renderiza `Login` o `DriverLayout`
- Persiste sesión del repartidor en `localStorage`
- Coordina la vista activa (pedidos, perfil, billetera, configuración)

#### `main.tsx`
**Función**: Punto de entrada de la aplicación React del repartidor.
- Inicializa React DOM
- Importa estilos globales y utilidades

---

### 📂 `App Repartidor/src/types/`

#### `order.ts`
**Función**: Define tipos TypeScript relacionados con pedidos (compartido con proyecto principal).

#### `driver.ts`
**Función**: Define tipos y datos mock de repartidores.
- `Driver`: Interfaz de repartidor (id, credenciales, información personal, estado activo)
- `mockDrivers`: Repartidores de prueba para desarrollo

---

### 📂 `App Repartidor/src/utils/`

#### `dateUtils.ts`, `priceUtils.ts`, `statusUtils.ts`, `mockData.ts`
**Función**: Mismas utilidades que el proyecto principal (duplicadas para independencia).

---

### 📂 `App Repartidor/src/components/`

#### `Login.tsx`
**Función**: Componente de autenticación para repartidores.
- Formulario de login específico para repartidores
- Valida credenciales contra `mockDrivers`
- Botones de acceso rápido para desarrollo
- Tema visual diferente (púrpura)

#### `DriverApp.tsx`
**Función**: Componente principal de la aplicación del repartidor.
- Estadísticas de pedidos (total, asignados, entregados)
- Tabs para filtrar pedidos (todos, disponibles, asignados)
- Lista de pedidos disponibles y asignados
- Maneja la aceptación de pedidos y cambio de estados
- Integra diferentes vistas según `activeView` (pedidos, perfil, billetera, configuración)

#### `OrderList.tsx`
**Función**: Componente que renderiza la lista de pedidos (compartido con proyecto principal).

#### `OrderCard.tsx` (en `driver/`)
**Función**: Tarjeta individual de pedido para la vista de repartidor.
- Muestra información resumida del pedido
- Diferencia visual entre pedidos disponibles y asignados
- Badge de "Asignado a ti" para pedidos propios
- Botón para ver detalles o aceptar pedido

#### `OrderDetail.tsx` (en `driver/`)
**Función**: Vista detallada de un pedido para repartidor (modal).
- Muestra toda la información del pedido
- Botones de acción según el estado:
  - "Aceptar pedido" si está disponible
  - "Marcar como en camino" si está asignado
  - "Marcar como Producto retirado" (requiere código)
  - "Entregar pedido" si el producto fue retirado
- Integra `PickupCodeModal` para validar código de retiro

#### `PickupCodeModal.tsx`
**Función**: Modal para ingresar código de retiro.
- Solicita código de 6 dígitos antes de marcar como "Producto retirado"
- Valida que el código coincida con el del pedido
- Muestra errores de validación
- Diseño con tema amarillo/dorado

#### `DriverSidebar.tsx`
**Función**: Menú lateral de navegación del repartidor.
- Navegación entre vistas (Pedidos, Perfil, Billetera, Configuración)
- Información del repartidor
- Overlay en móvil
- Solo visible en móvil (app mobile-only)

#### `DriverProfile.tsx`
**Función**: Vista de perfil del repartidor.
- Muestra información personal (nombre, email, teléfono)
- Avatar con gradiente
- Diseño tipo tarjeta

#### `DriverWallet.tsx`
**Función**: Vista de billetera/ganancias del repartidor.
- Muestra ganancias totales
- Estadísticas de ganancias (del día, del mes)
- Historial de transacciones (placeholder)

#### `DriverSettings.tsx`
**Función**: Vista de configuración del repartidor.
- Toggles para notificaciones, privacidad, modo oscuro, idioma
- Diseño tipo lista de configuraciones

#### `Modal.tsx` (en `common/`)
**Función**: Componente modal reutilizable (mismo que proyecto principal).

---

### 📂 `App Repartidor/src/layouts/`

#### `DriverLayout.tsx`
**Función**: Layout principal de la aplicación del repartidor.
- Header fijo con menú hamburguesa, nombre del repartidor, switch de conexión y botón de logout
- Integra `DriverSidebar` para navegación
- Diseño mobile-only (sin estilos de desktop)
- Contenedor para el contenido principal

---

### 📂 `App Repartidor/src/styles/`

#### Organización de Estilos

Misma estructura que el proyecto principal:
- **`styles/Components/`**: Estilos de componentes
  - `driver/`: Estilos de componentes específicos del repartidor
  - `common/`: Estilos de componentes compartidos
- **`styles/layouts/`**: Estilos de layouts
- **`styles/utils/`**: Estilos de utilidades
- **`globals.css`**: Estilos globales

---

## 🔄 Flujo de la Aplicación

### Aplicación de Empresa

1. **Login** → Usuario ingresa credenciales
2. **CompanyLayout** → Renderiza header y contenedor
3. **CompanyPanel** → Panel principal con:
   - Sidebar con estadísticas y acciones
   - Lista de pedidos filtrados
4. **Crear Pedido** → `CreateOrderForm` → Genera código de retiro → Agrega a lista
5. **Gestionar Clientes** → `ClientManagement` → `CreateClientForm`
6. **Ver Detalles** → `OrderDetail` (modal)

### Aplicación de Repartidor

1. **Login** → Repartidor ingresa credenciales
2. **DriverLayout** → Renderiza header con menú y switch de conexión
3. **DriverApp** → Vista principal con:
   - Estadísticas
   - Lista de pedidos disponibles/asignados
4. **Aceptar Pedido** → Cambia estado a "Asignado"
5. **Marcar como en camino** → Cambia estado a "En camino al retiro"
6. **Marcar como retirado** → `PickupCodeModal` → Valida código → Cambia estado a "Producto retirado"
7. **Entregar pedido** → Cambia estado a "Entregado"

---

## 📊 Estados de Pedidos

El flujo de estados es:
1. **Pendiente** → Pedido creado, sin asignar
2. **Asignado** → Repartidor aceptó el pedido
3. **En camino al retiro** → Repartidor está yendo a retirar el producto
4. **Producto retirado** → Repartidor retiró el producto (requiere código)
5. **Entregado** → Pedido completado

**Nota**: El estado "En entrega" fue eliminado. Después de "Producto retirado" va directo a "Entregado".

---

## 💾 Persistencia de Datos

- **localStorage**: Se usa para persistir:
  - Sesión de usuario/repartidor
  - Configuración de locales
  - Lista de clientes
  - Pedidos (en desarrollo, debería ser backend en producción)

---

## 🎨 Organización de Estilos

Todos los estilos están centralizados en `styles/` siguiendo la estructura de componentes:
- Cada componente tiene su archivo CSS correspondiente
- Estilos globales en `globals.css`
- Estilos de utilidades (como estados) en `styles/utils/`
- Estilos de layouts en `styles/layouts/`

Esta organización facilita:
- Mantenimiento
- Búsqueda de estilos
- Escalabilidad
- Separación de concerns

---

## 🔑 Características Principales

1. **Código de Retiro**: Cada pedido tiene un código único de 6 dígitos que el repartidor debe ingresar para retirar el producto
2. **Gestión de Clientes**: Sistema completo de CRUD de clientes con asignación a locales
3. **Multi-local**: Soporte para múltiples locales con filtrado por usuario
4. **Roles**: Sistema de roles (admin, local, superadmin) con permisos diferenciados
5. **Responsive**: Ambas aplicaciones son completamente responsive
6. **Mobile-only Repartidor**: La app de repartidor está diseñada solo para móvil

---

## 📝 Notas de Desarrollo

- Los datos están en `localStorage` (mock para desarrollo)
- En producción, debería conectarse a un backend real
- Los usuarios y repartidores están hardcodeados en `mockUsers` y `mockDrivers`
- Los pedidos iniciales están en `mockData.ts`

