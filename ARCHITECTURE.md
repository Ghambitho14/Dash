# Arquitectura del Proyecto - Sistema de Delivery

Este documento describe la arquitectura completa del sistema de delivery, incluyendo las tres aplicaciones principales y su estructura.

---

## Estructura General del Proyecto

```
App/
├── src/                          # DeliveryApp (App Empresarial) - Solo Web
├── Paneladmin/                   # Panel Admin - Solo Web
├── App Repartidor/               # App Repartidor - Web + APK Android
├── Database/                     # Scripts SQL y documentación de BD
├── server.js                     # Servidor Express unificado
└── package.json                  # Configuración principal
```

---

## Aplicaciones del Sistema

### 1. **DeliveryApp (App Empresarial)**
**Ubicación**: `src/`  
**Tipo**: Aplicación Web (React + Vite)  
**Plataforma**: Solo Web (NO compila como APK)  
**Puerto Desarrollo**: 5173 (por defecto)

#### Propósito
Aplicación para empresas y administradores locales para gestionar pedidos, clientes, usuarios y locales.

#### Tecnologías
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Base de Datos**: Supabase
- **Iconos**: Lucide React
- **Estilos**: CSS Modules

#### Componentes Principales

##### Layouts
- **`CompanyLayout.jsx`**: Layout principal con header, sidebar y área de contenido

##### Componentes Core
- **`CompanyPanel.jsx`**: Panel principal con gestión de pedidos, clientes y usuarios
- **`Login.jsx`**: Autenticación de usuarios empresariales
- **`OrderList.jsx`**: Lista de pedidos con filtros
- **`OrderCard.jsx`**: Tarjeta individual de pedido
- **`OrderDetail.jsx`**: Modal con detalles completos del pedido
- **`CreateOrderForm.jsx`**: Formulario para crear nuevos pedidos
- **`ClientManagement.jsx`**: Gestión CRUD de clientes
- **`CreateClientForm.jsx`**: Formulario de creación/edición de clientes
- **`UserManagement.jsx`**: Gestión CRUD de usuarios
- **`CreateUserForm.jsx`**: Formulario de creación/edición de usuarios
- **`LocalSettings.jsx`**: Configuración de locales
- **`Modal.jsx`**: Componente modal reutilizable

#### Estados de Pedidos
1. **Pendiente** → Pedido creado, sin asignar
2. **Asignado** → Repartidor aceptó el pedido
3. **En camino al retiro** → Repartidor yendo a retirar
4. **Producto retirado** → Repartidor retiró (requiere código)
5. **Entregado** → Pedido completado

#### Roles de Usuario
- **`empresarial`**: Acceso completo a todas las funciones
- **`admin`**: Administrador con permisos extendidos
- **`local`**: Usuario de local específico, acceso limitado

---

### 2. **Panel Admin**
**Ubicación**: `Paneladmin/`  
**Tipo**: Aplicación Web (React + Vite)  
**Plataforma**: Solo Web (NO compila como APK)  
**Puerto Desarrollo**: 5174 (o siguiente disponible)

#### Propósito
Panel de administración para superadministradores. Permite crear empresas, repartidores y usuarios empresariales.

#### Tecnologías
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Base de Datos**: Supabase
- **Iconos**: Lucide React

#### Componentes Principales
- **`Dashboard.jsx`**: Panel principal con gestión de empresas y repartidores
- **`Login.jsx`**: Autenticación de superadministradores

#### Funcionalidades
- Crear empresas (`companies`)
- Crear repartidores (`drivers`)
- Crear usuarios empresariales automáticamente al crear empresa

---

### 3. **App Repartidor**
**Ubicación**: `App Repartidor/`  
**Tipo**: Aplicación Híbrida (React + Capacitor)  
**Plataforma**: Web + APK Android  
**Puerto Desarrollo**: 5175 (o siguiente disponible)

#### Propósito
Aplicación móvil para repartidores. Permite aceptar pedidos, actualizar estados y gestionar entregas.

#### Tecnologías
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Mobile**: Capacitor 6.0.0
- **Base de Datos**: Supabase
- **Iconos**: Lucide React

#### Componentes Principales

##### Layouts
- **`DriverLayout.jsx`**: Layout con header, menú hamburguesa y switch de conexión

##### Componentes Core
- **`DriverApp.jsx`**: Vista principal con pedidos disponibles y asignados
- **`Login.jsx`**: Autenticación de repartidores
- **`DriverSidebar.jsx`**: Menú lateral con navegación
- **`OrderList.jsx`**: Lista de pedidos
- **`OrderCard.jsx`**: Tarjeta de pedido
- **`OrderDetail.jsx`**: Detalles del pedido
- **`PickupCodeModal.jsx`**: Modal para validar código de retiro
- **`DriverProfile.jsx`**: Perfil del repartidor
- **`DriverWallet.jsx`**: Billetera con ganancias
- **`DriverSettings.jsx`**: Configuración del repartidor
- **`Modal.jsx`**: Componente modal reutilizable

#### Funcionalidades Especiales
- **Timeout automático**: Pedidos "Asignado" se revierten a "Pendiente" si no se actualizan en 1 minuto
- **Recarga periódica**: Pedidos se recargan automáticamente cada 30 segundos
- **Historial de estados**: Cada cambio se registra en `order_status_history`
- **Vista de completados**: Los repartidores pueden ver sus pedidos entregados

#### Compilación APK
- **Configuración**: `capacitor.config.json`
- **Script**: `build-apk.bat` (Windows) o `build-apk.sh` (Linux/Mac)
- **Salida**: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Base de Datos (Supabase)

### Tablas Principales

#### `companies`
- Información de empresas
- Usado por: App Empresarial (lectura), Panel Admin (CRUD)

#### `company_users`
- Usuarios de empresas
- Roles: `empresarial`, `admin`, `local`
- Usado por: App Empresarial (CRUD + Login), Panel Admin (crear)

#### `drivers`
- Repartidores
- Usado por: App Repartidor (Login + lectura), Panel Admin (CRUD), App Empresarial (lectura)

#### `locals`
- Locales/sucursales de empresas
- Usado por: App Empresarial (CRUD), App Repartidor (lectura)

#### `clients`
- Clientes
- Relación con `locals`
- Usado por: App Empresarial (CRUD), App Repartidor (lectura)

#### `orders`
- Pedidos
- Estados: Pendiente, Asignado, En camino al retiro, Producto retirado, Entregado
- Relaciones: `clients`, `locals`, `drivers`, `company_users`
- Usado por: Todas las apps

#### `order_status_history`
- Historial de cambios de estado de pedidos
- Usado por: App Repartidor (crear)

#### `superadmins`
- Superadministradores
- Usado por: Panel Admin (Login)

---

## Flujos de Datos

### Flujo de Creación de Pedido
1. Usuario empresarial crea pedido en `CreateOrderForm`
2. Se genera código de retiro único (6 dígitos)
3. Pedido se guarda en `orders` con estado "Pendiente"
4. App Repartidor recibe el pedido en tiempo real
5. Repartidor acepta → Estado cambia a "Asignado"
6. Repartidor marca "En camino" → Estado cambia a "En camino al retiro"
7. Repartidor ingresa código → Estado cambia a "Producto retirado"
8. Repartidor entrega → Estado cambia a "Entregado"

### Flujo de Autenticación

#### App Empresarial
1. Usuario ingresa email y password
2. Consulta en `company_users` con filtro `active = true`
3. Carga datos relacionados: `companies`, `locals`
4. Guarda sesión en `localStorage`

#### App Repartidor
1. Repartidor ingresa username y password
2. Consulta en `drivers` con filtro `active = true`
3. Guarda sesión en `localStorage`

#### Panel Admin
1. Superadmin ingresa email y password
2. Consulta en `superadmins` con filtro `active = true`
3. Guarda sesión en `localStorage`

---

## Organización de Estilos

### Estructura de CSS
```
styles/
├── globals.css                   # Estilos globales
├── layouts/                      # Estilos de layouts
│   └── CompanyLayout.css
├── Components/                   # Estilos por componente
│   ├── CompanyPanel.css
│   ├── OrderCard.css
│   ├── Login.css
│   └── ...
└── utils/                        # Utilidades CSS
    └── statusUtils.css           # Estilos de estados
```

### Responsive Design
- **Desktop**: Layout completo con sidebar visible
- **Tablet**: Sidebar colapsable, ajustes de padding
- **Mobile**: Sidebar como overlay, tabs horizontales, modales desde abajo

---

## Servidor Unificado

### `server.js`
Servidor Express que sirve ambas aplicaciones web:

- **DeliveryApp**: `http://localhost:3000/`
- **Panel Admin**: `http://localhost:3000/admin`

### Scripts Disponibles
```bash
npm run build:all      # Compila ambas apps web
npm run start          # Inicia servidor (requiere compilación)
npm run start:prod     # Compila y inicia servidor
```

---

## Dependencias Principales

### Compartidas
- `@supabase/supabase-js`: ^2.87.1
- `lucide-react`: Iconos
- `react`: Framework
- `react-dom`: Renderizado

### App Empresarial
- `express`: ^4.18.2 (servidor)

### App Repartidor
- `@capacitor/android`: ^6.0.0
- `@capacitor/cli`: ^6.0.0
- `@capacitor/core`: ^6.0.0

---

## Seguridad

### Autenticación
- Autenticación basada en tablas de Supabase
- Validación de usuarios activos (`active = true`)
- Sesiones guardadas en `localStorage`

### Código de Retiro
- Código único de 6 dígitos por pedido
- Generado al crear el pedido
- Validado antes de cambiar estado a "Producto retirado"

---

## Compilación y Despliegue

### App Empresarial
```bash
npm run build        # Compila para web
npm run start        # Servidor de producción
```

### Panel Admin
```bash
cd Paneladmin
npm run build        # Compila para web
```

### App Repartidor
```bash
cd "App Repartidor"
npm run build        # Compila para web
build-apk.bat        # Compila y prepara para APK
npm run cap:open:android  # Abre Android Studio
```

---

## Estructura de Archivos Detallada

### App Empresarial (`src/`)
```
src/
├── App.jsx                    # Componente raíz
├── main.jsx                   # Punto de entrada
├── components/                # Componentes React
│   ├── CompanyPanel.jsx
│   ├── Login.jsx
│   ├── OrderList.jsx
│   ├── OrderCard.jsx
│   ├── OrderDetail.jsx
│   ├── CreateOrderForm.jsx
│   ├── ClientManagement.jsx
│   ├── CreateClientForm.jsx
│   ├── UserManagement.jsx
│   ├── CreateUserForm.jsx
│   ├── LocalSettings.jsx
│   └── Modal.jsx
├── layouts/                   # Layouts
│   └── CompanyLayout.jsx
├── styles/                     # Estilos CSS
│   ├── globals.css
│   ├── layouts/
│   ├── Components/
│   └── utils/
├── types/                      # Tipos y estructuras
│   ├── order.js
│   ├── client.js
│   └── user.js
└── utils/                      # Utilidades
    ├── supabase.js
    ├── utils.js
    └── mockData.js
```

### App Repartidor (`App Repartidor/src/`)
```
App Repartidor/src/
├── App.jsx                    # Componente raíz
├── main.jsx                   # Punto de entrada
├── components/                # Componentes React
│   ├── DriverApp.jsx
│   ├── Login.jsx
│   ├── DriverSidebar.jsx
│   ├── OrderList.jsx
│   ├── OrderCard.jsx
│   ├── OrderDetail.jsx
│   ├── PickupCodeModal.jsx
│   ├── DriverProfile.jsx
│   ├── DriverWallet.jsx
│   ├── DriverSettings.jsx
│   └── Modal.jsx
├── layouts/                   # Layouts
│   └── DriverLayout.jsx
├── styles/                     # Estilos CSS
│   ├── globals.css
│   ├── layouts/
│   ├── Components/
│   └── utils/
├── types/                      # Tipos y estructuras
│   ├── order.js
│   └── driver.js
└── utils/                      # Utilidades
    ├── supabase.js
    ├── utils.js
    └── mockData.js
```

---

## Patrones de Diseño

### Estado Global
- Estado gestionado con React Hooks (`useState`, `useEffect`, `useCallback`)
- Datos persistentes en `localStorage`
- Sincronización con Supabase en tiempo real

### Componentes
- Componentes funcionales con Hooks
- Separación de responsabilidades
- Componentes reutilizables (Modal, OrderCard, etc.)

### Estilos
- CSS Modules por componente
- Estilos globales centralizados
- Utilidades CSS compartidas

---

## Notas de Desarrollo

### Convenciones
- Nombres de componentes en PascalCase
- Archivos CSS con mismo nombre que componente
- Funciones helper en `utils/`
- Tipos y estructuras en `types/`

### Variables de Entorno
Todas las apps requieren `.env`:
```env
VITE_PROJECT_URL=tu_url_supabase
VITE_ANNON_KEY=tu_anon_key
```

### Responsive
- Media queries en todos los componentes
- Breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px)

---

## Mejoras Futuras

- [ ] Notificaciones push para repartidores
- [ ] Geolocalización real para asignación de pedidos
- [ ] Sistema de calificaciones
- [ ] Chat entre empresa y repartidor
- [ ] Dashboard con métricas y estadísticas
- [ ] Exportación de reportes
- [ ] Multi-idioma (i18n)

---

## Documentación Adicional

- `README_COMPILACION.md`: Guía de compilación
- `Database/README.md`: Documentación de base de datos
- `User.md`: Información de usuarios

---

**Última actualización**: 2024

