# Arquitectura del Proyecto - Sistema de Delivery

Este documento describe la arquitectura completa del sistema de delivery, incluyendo las tres aplicaciones principales y su estructura.

---

## Estructura General del Proyecto

```
App/
├── Panelempresa/                  # DeliveryApp (App Empresarial) - Solo Web
│   └── src/                       # Código fuente
├── Paneladmin/                    # Panel Admin - Solo Web
├── PanelRepartidor/               # App Repartidor - Web + APK Android
├── Database/                      # Scripts SQL y documentación de BD
├── CHECKLIST_PRODUCCION.md        # Checklist para producción
└── package.json                   # Configuración principal (si existe)
```

---

## Aplicaciones del Sistema

### 1. **DeliveryApp (App Empresarial)**
**Ubicación**: `Panelempresa/src/`  
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

#### Arquitectura de Capas

La aplicación sigue una arquitectura en capas que separa la lógica de negocio de los componentes:

##### Services (`services/`)
Capa de servicios que maneja toda la comunicación con Supabase:
- **`authService.js`**: Autenticación de usuarios empresariales
- **`orderService.js`**: Operaciones CRUD de pedidos (crear, leer, eliminar, formatear)
- **`clientService.js`**: Operaciones CRUD de clientes
- **`userService.js`**: Operaciones CRUD de usuarios empresariales
- **`localService.js`**: Operaciones CRUD de locales

##### Hooks (`hooks/`)
Hooks personalizados que encapsulan lógica de estado y efectos:
- **`useAuth.js`**: Gestión de autenticación (login, logout, estado de usuario)
- **`useLogin.js`**: Lógica específica del formulario de login
- **`useOrders.js`**: Gestión de estado y carga de pedidos
- **`useClients.js`**: Gestión de estado y carga de clientes
- **`useUsers.js`**: Gestión de estado y carga de usuarios
- **`useLocals.js`**: Gestión de estado y carga de locales
- **`useCompanyPanel.js`**: Lógica del panel principal
- **`useCreateOrderForm.js`**: Lógica del formulario de creación de pedidos
- **`useCreateClientForm.js`**: Lógica del formulario de creación de clientes
- **`useCreateUserForm.js`**: Lógica del formulario de creación de usuarios
- **`useClientManagement.js`**: Lógica de gestión de clientes
- **`useUserManagement.js`**: Lógica de gestión de usuarios
- **`useLocalSettings.js`**: Lógica de configuración de locales

##### Componentes (`components/`)
Componentes React que se enfocan únicamente en la presentación:

###### Layouts
- **`CompanyLayout.jsx`**: Layout principal con header, sidebar y área de contenido

###### Componentes Core
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
**Ubicación**: `PanelRepartidor/`  
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
- **Supabase Realtime**: Escucha cambios en tiempo real en la tabla `orders` (implementado)
- **Timeout automático**: Pedidos "Asignado" se revierten a "Pendiente" si no se actualizan en 1 minuto
- **Recarga periódica**: Fallback de 60 segundos si Realtime falla (polling de 1 segundo como redundancia)
- **Historial de estados**: Cada cambio se registra en `order_status_history`
- **Vista de completados**: Los repartidores pueden ver sus pedidos entregados
- **Máquina de estados**: Validación de transiciones de estado mediante `orderStateMachine.jsx`

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
1. Usuario empresarial completa formulario en `CreateOrderForm` (componente)
2. Hook `useCreateOrderForm` valida datos y genera código de retiro único (6 dígitos)
3. Servicio `orderService.createOrder` guarda pedido en `orders` con estado "Pendiente"
4. Hook actualiza estado local y notifica éxito
5. **App Repartidor recibe el pedido en tiempo real** (Supabase Realtime - implementado)
6. **DeliveryApp actualiza pedidos** (polling cada 2 segundos - se recomienda implementar Realtime)
7. Repartidor acepta → Estado cambia a "Asignado" (validado por máquina de estados)
8. Repartidor marca "En camino" → Estado cambia a "En camino al retiro"
9. Repartidor ingresa código → Estado cambia a "Producto retirado" (código validado)
10. Repartidor entrega → Estado cambia a "Entregado"

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

### Flujo de Datos entre Capas

#### Ejemplo: Crear un Pedido

1. **Componente** (`CreateOrderForm.jsx`):
   - Usuario completa el formulario
   - Llama al hook `useCreateOrderForm`

2. **Hook** (`useCreateOrderForm.js`):
   - Gestiona el estado del formulario
   - Valida datos
   - Llama al servicio `createOrder` de `orderService.js`

3. **Servicio** (`orderService.js`):
   - Formatea los datos al formato de Supabase
   - Ejecuta la inserción en la base de datos
   - Formatea la respuesta al formato de la aplicación
   - Retorna el pedido formateado

4. **Hook** (continúa):
   - Actualiza el estado local con el nuevo pedido
   - Notifica al componente del éxito/error

5. **Componente** (continúa):
   - Muestra mensaje de éxito
   - Cierra el modal o resetea el formulario

#### Ejemplo: Autenticación

1. **Componente** (`Login.jsx`):
   - Usuario ingresa credenciales
   - Llama al hook `useLogin`

2. **Hook** (`useLogin.js`):
   - Gestiona estado de carga y errores
   - Llama al hook `useAuth`

3. **Hook** (`useAuth.js`):
   - Llama al servicio `authenticateUser` de `authService.js`

4. **Servicio** (`authService.js`):
   - Consulta `company_users` en Supabase
   - Valida credenciales
   - Carga datos relacionados (empresa, local)
   - Retorna usuario formateado

5. **Hook** (`useAuth.js`):
   - Guarda usuario en estado
   - Persiste en `localStorage`

6. **Componente** (`Login.jsx`):
   - Redirige al panel principal

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

**⚠️ IMPORTANTE - Seguridad de Contraseñas**:
- Actualmente las contraseñas se almacenan en texto plano en la base de datos
- **Se recomienda implementar hashing de contraseñas (bcrypt) antes de producción**
- Ver `CHECKLIST_PRODUCCION.md` para detalles sobre implementación de seguridad

### Código de Retiro
- Código único de 6 dígitos por pedido
- Generado al crear el pedido
- Validado antes de cambiar estado a "Producto retirado"
- Validación mediante máquina de estados (`orderStateMachine.jsx`)

---

## Compilación y Despliegue

### App Empresarial
```bash
cd Panelempresa
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
cd PanelRepartidor
npm run build        # Compila para web
build-apk.bat        # Compila y prepara para APK
npm run cap:open:android  # Abre Android Studio
```

---

## Estructura de Archivos Detallada

### App Empresarial (`Panelempresa/src/`)
```
src/
├── App.jsx                    # Componente raíz
├── main.jsx                   # Punto de entrada
├── components/                # Componentes React (presentación)
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
│   ├── CompanyLayout.jsx
│   └── Modal.jsx
├── hooks/                      # Hooks personalizados (lógica de estado)
│   ├── useAuth.js
│   ├── useLogin.js
│   ├── useOrders.js
│   ├── useClients.js
│   ├── useUsers.js
│   ├── useLocals.js
│   ├── useCompanyPanel.js
│   ├── useCreateOrderForm.js
│   ├── useCreateClientForm.js
│   ├── useCreateUserForm.js
│   ├── useClientManagement.js
│   ├── useUserManagement.js
│   └── useLocalSettings.js
├── services/                   # Servicios (comunicación con Supabase)
│   ├── authService.js
│   ├── orderService.js
│   ├── clientService.js
│   ├── userService.js
│   └── localService.js
├── layouts/                    # Layouts (deprecado, movido a components/)
│   └── CompanyLayout.jsx
├── styles/                     # Estilos CSS
│   ├── globals.css
│   ├── layouts/
│   ├── Components/
│   └── utils/
├── types/                      # Tipos y estructuras (reservado para futuro)
└── utils/                      # Utilidades
    ├── supabase.js
    └── utils.js
```

### App Repartidor (`PanelRepartidor/src/`)
```
src/
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

### Arquitectura en Capas

La aplicación sigue una arquitectura en capas que separa claramente las responsabilidades:

1. **Capa de Presentación** (`components/`): Componentes React que solo manejan UI
2. **Capa de Lógica** (`hooks/`): Hooks personalizados que encapsulan estado y efectos
3. **Capa de Servicios** (`services/`): Funciones que manejan comunicación con Supabase
4. **Capa de Utilidades** (`utils/`): Funciones helper y configuración

#### Flujo de Datos
```
Componente → Hook → Service → Supabase
     ↑                           ↓
     └────────── Estado ─────────┘
```

### Estado Global
- Estado gestionado con React Hooks (`useState`, `useEffect`, `useCallback`)
- Hooks personalizados encapsulan lógica compleja
- Datos persistentes en `localStorage`
- **Sincronización con Supabase**:
  - **App Repartidor**: Implementa Supabase Realtime + fallback de 60s
  - **DeliveryApp**: Usa polling cada 2 segundos (se recomienda implementar Realtime)
  - Ver `CHECKLIST_PRODUCCION.md` para optimizaciones de performance

### Componentes
- Componentes funcionales con Hooks
- Separación de responsabilidades: UI en componentes, lógica en hooks
- Componentes reutilizables (Modal, OrderCard, etc.)
- Los componentes consumen hooks, no servicios directamente

### Servicios
- Funciones puras que manejan comunicación con Supabase
- Formateo de datos entre formato BD y formato aplicación
- Manejo de errores (actualmente inconsistente - ver `CHECKLIST_PRODUCCION.md`)
- Reutilizables entre diferentes hooks y componentes
- **Nota**: Algunos servicios usan `console.error` directamente - se recomienda centralizar logging

### Estilos
- CSS Modules por componente
- Estilos globales centralizados
- Utilidades CSS compartidas

---

## Notas de Desarrollo

### Convenciones
- Nombres de componentes en PascalCase
- Archivos CSS con mismo nombre que componente
- Hooks personalizados con prefijo `use` (ej: `useAuth`, `useOrders`)
- Servicios con sufijo `Service` (ej: `authService`, `orderService`)
- Funciones helper en `utils/`
- Tipos y estructuras en `types/` (reservado para futuro uso)

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

## Sincronización en Tiempo Real

### App Repartidor
- **Implementado**: Supabase Realtime para cambios en `orders`
- Canal: `orders-company-{companyId}`
- Fallback: Polling cada 60 segundos si Realtime falla
- Polling adicional: Cada 1 segundo como redundancia (se recomienda optimizar)

### DeliveryApp
- **No implementado**: Actualmente usa polling cada 2 segundos
- **Recomendación**: Implementar Supabase Realtime similar a App Repartidor
- Ver `CHECKLIST_PRODUCCION.md` sección "Performance" para detalles

---

## Manejo de Errores

### Estado Actual
- Mezcla de `alert()`, `console.error()`, y `toast` (react-hot-toast)
- Algunos errores solo se muestran en consola
- No hay manejo centralizado de errores
- No hay Error Boundaries de React

### Archivos con Manejo de Errores
- `Panelempresa/src/App.jsx`: Usa `toast` correctamente
- `PanelRepartidor/src/components/DriverApp.jsx`: Usa `alert()`
- `PanelRepartidor/src/App.jsx`: Usa `alert()`

**Recomendación**: Estandarizar manejo de errores. Ver `CHECKLIST_PRODUCCION.md` sección "Código y Arquitectura".

---

## Mejoras Futuras

### Funcionalidades
- [ ] Notificaciones push para repartidores
- [ ] Geolocalización real para asignación de pedidos
- [ ] Sistema de calificaciones
- [ ] Chat entre empresa y repartidor
- [ ] Dashboard con métricas y estadísticas
- [ ] Exportación de reportes
- [ ] Multi-idioma (i18n)

### Técnicas (Ver `CHECKLIST_PRODUCCION.md` para detalles completos)
- [ ] Implementar hashing de contraseñas (CRÍTICO)
- [ ] Implementar Supabase Realtime en DeliveryApp
- [ ] Optimizar componentes React (React.memo, useMemo)
- [ ] Estandarizar manejo de errores
- [ ] Eliminar console.logs de producción
- [ ] Implementar Error Boundaries
- [ ] Agregar validaciones robustas en formularios
- [ ] Implementar testing (unitario, integración, E2E)
- [ ] Migrar gradualmente a TypeScript

---

## Documentación Adicional

- `AGENTS.MD`: Guía para agentes de IA trabajando en el proyecto
- `Panelempresa/Database/README.md`: Documentación de base de datos
- `Panelempresa/README.md`: Documentación general del proyecto
- `PanelRepartidor/README.md`: Documentación de App Repartidor
- `Paneladmin/README.md`: Documentación de Panel Admin
- `CHECKLIST_PRODUCCION.md`: Checklist para producción

---

## Áreas de Mejora Conocidas

### 🔴 Crítico
1. **Seguridad de contraseñas**: Implementar hashing (bcrypt) antes de producción
2. **Exposición de contraseñas**: Eliminar password de objetos de usuario retornados

### 🟠 Alta Prioridad
3. **Performance**: Implementar Supabase Realtime en DeliveryApp (actualmente usa polling cada 2s)
4. **Optimización React**: Agregar memoización (React.memo, useMemo, useCallback)

### 🟡 Media Prioridad
5. **Manejo de errores**: Estandarizar (eliminar alert(), usar toast consistentemente)
6. **Logging**: Eliminar console.logs de producción, crear logger condicional
7. **Validaciones**: Agregar validaciones robustas en formularios

**Ver `CHECKLIST_PRODUCCION.md` para análisis completo con ubicaciones exactas, soluciones y plan de acción detallado.**

---

**Última actualización**: Diciembre 2024

