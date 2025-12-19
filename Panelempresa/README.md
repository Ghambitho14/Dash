# Sistema de Delivery - Aplicación Empresarial

Sistema completo de gestión de delivery con tres aplicaciones integradas: aplicación empresarial para gestión de pedidos, panel de administración para superadministradores, y aplicación móvil para repartidores.

## Descripción General

Este proyecto es un sistema multi-aplicación para la gestión de pedidos de delivery que incluye:

- **DeliveryApp (App Empresarial)**: Aplicación web para empresas y administradores locales (esta carpeta)
- **Panel Admin**: Panel de administración para superadministradores (`../Paneladmin/`)
- **App Repartidor**: Aplicación móvil (web + APK Android) para repartidores (`../PanelRepartidor/`)

Todas las aplicaciones están integradas con Supabase como base de datos y backend.

## Estructura del Proyecto

```
App/
├── Panelempresa/                 # DeliveryApp (App Empresarial) - Solo Web (esta carpeta)
│   ├── src/                      # Código fuente de la aplicación
│   ├── Database/                 # Scripts SQL y documentación de BD
│   └── README.md                 # Este archivo
├── Paneladmin/                    # Panel Admin - Solo Web
├── PanelRepartidor/              # App Repartidor - Web + APK Android
├── ARCHITECTURE.md                # Documentación de arquitectura (raíz)
├── AGENTS.MD                      # Guía para agentes de IA (raíz)
└── CHECKLIST_PRODUCCION.md        # Checklist para producción (raíz)
```

## Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- Cuenta de Supabase configurada
- Para compilar APK: Android Studio instalado

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd App
```

### 2. Instalar dependencias

```bash
# Instalar dependencias de App Empresarial
cd Panelempresa
npm install

# Instalar dependencias de Panel Admin
cd ../Paneladmin
npm install

# Instalar dependencias de App Repartidor
cd ../PanelRepartidor
npm install
```

### 3. Configurar variables de entorno

Crea archivos `.env` en cada aplicación con las credenciales de Supabase:

**Panelempresa/.env:**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu_anon_key_aqui
```

**Paneladmin/.env:**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu_anon_key_aqui
```

**PanelRepartidor/.env:**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu_anon_key_aqui
```

### 4. Configurar la base de datos

Consulta la documentación en `Database/README.md` para configurar la base de datos en Supabase.

## Desarrollo

### App Empresarial (DeliveryApp)

```bash
# Desde la carpeta Panelempresa
cd Panelempresa
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Panel Admin

```bash
cd ../Paneladmin
npm run dev
```

La aplicación estará disponible en `http://localhost:5174` (o siguiente puerto disponible)

### App Repartidor

```bash
cd ../PanelRepartidor
npm run dev
```

La aplicación estará disponible en `http://localhost:5175` (o siguiente puerto disponible)

## Compilación para Producción

### App Empresarial

```bash
cd Panelempresa
npm run build
```

Los archivos compilados estarán en `Panelempresa/dist/`

### Panel Admin

```bash
cd Paneladmin
npm run build
```

Los archivos compilados estarán en `Paneladmin/dist/`

### App Repartidor (Web)

```bash
cd PanelRepartidor
npm run build
```

Los archivos compilados estarán en `PanelRepartidor/dist/`

### App Repartidor (APK Android)

**Windows:**
```bash
cd ../PanelRepartidor
build-apk.bat
```

**Linux/Mac:**
```bash
cd ../PanelRepartidor
chmod +x build-apk.sh
./build-apk.sh
```

**Manual:**
```bash
cd ../PanelRepartidor
npm run build
npx cap sync
npm run cap:open:android
```

Luego en Android Studio:
1. Espera a que Gradle sincronice
2. Ve a: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

## Aplicaciones del Sistema

### 1. DeliveryApp (App Empresarial)

**Ubicación**: `Panelempresa/src/`  
**Tipo**: Aplicación Web (React + Vite)  
**Plataforma**: Solo Web

#### Funcionalidades

- Crear y gestionar pedidos de delivery
- Administrar clientes y sus direcciones
- Gestionar usuarios (empresariales, admin, locales)
- Configurar locales/sucursales
- Ver estadísticas y estado de pedidos en tiempo real

#### Roles de Usuario

- **empresarial**: Acceso completo a todas las funciones
- **admin**: Administrador con permisos extendidos
- **local**: Usuario de local específico, acceso limitado

#### Estados de Pedidos

1. **Pendiente**: Pedido creado, sin asignar
2. **Asignado**: Repartidor aceptó el pedido
3. **En camino al retiro**: Repartidor yendo a retirar
4. **Producto retirado**: Repartidor retiró (requiere código)
5. **Entregado**: Pedido completado

### 2. Panel Admin

**Ubicación**: `../Paneladmin/`  
**Tipo**: Aplicación Web (React + Vite)  
**Plataforma**: Solo Web

#### Funcionalidades

- Crear nuevas empresas
- Crear repartidores
- Crear usuarios empresariales automáticamente al crear empresas
- Gestionar el sistema completo

#### Autenticación

Los superadministradores se autentican con email y password contra la tabla `superadmins` en Supabase.

### 3. App Repartidor

**Ubicación**: `../PanelRepartidor/`  
**Tipo**: Aplicación Híbrida (React + Capacitor)  
**Plataforma**: Web + APK Android

#### Funcionalidades

- Ver pedidos disponibles
- Aceptar pedidos
- Actualizar estado de pedidos
- Validar código de retiro
- Ver pedidos completados
- Gestionar perfil y configuración
- Ver ganancias en billetera

#### Funcionalidades Especiales

- **Timeout automático**: Pedidos "Asignado" se revierten a "Pendiente" si no se actualizan en 1 minuto
- **Recarga periódica**: Pedidos se recargan automáticamente cada 30 segundos
- **Historial de estados**: Cada cambio se registra en `order_status_history`

## Base de Datos

El sistema utiliza Supabase (PostgreSQL) como base de datos. Las tablas principales son:

- `companies`: Información de empresas
- `company_users`: Usuarios de empresas (roles: empresarial, admin, local)
- `drivers`: Repartidores
- `locals`: Locales/sucursales de empresas
- `clients`: Clientes
- `orders`: Pedidos
- `order_status_history`: Historial de cambios de estado de pedidos
- `superadmins`: Superadministradores

Para más detalles sobre la base de datos, consulta `Database/README.md`

## Tecnologías Utilizadas

### Compartidas

- **React**: Framework de UI
- **Vite**: Build tool y servidor de desarrollo
- **Supabase**: Base de datos y backend
- **Lucide React**: Iconos
- **CSS Modules**: Estilos por componente

### Específicas

- **App Repartidor**: Capacitor 6.0.0 para compilación Android
- **Panel Admin**: React 19.2.0, Vite 7.2.4

## Scripts Disponibles

### App Empresarial

```bash
cd Panelempresa
npm run dev              # Servidor de desarrollo
npm run build            # Compilar para producción
npm run preview          # Preview de build
npm run lint             # Linter
```

### Panel Admin

```bash
cd Paneladmin
npm run dev              # Servidor de desarrollo
npm run build            # Compilar para producción
npm run preview          # Preview de build
npm run lint             # Linter
```

### App Repartidor

```bash
cd ../PanelRepartidor
npm run dev              # Servidor de desarrollo
npm run build            # Compilar para web
npm run apk:build        # Compilar y sincronizar para APK
npm run cap:sync         # Sincronizar con Capacitor
npm run cap:open:android # Abrir Android Studio
npm run lint             # Linter
```

## Flujo de Trabajo

### Creación de Pedido

1. Usuario empresarial crea pedido en `CreateOrderForm`
2. Se genera código de retiro único (6 dígitos)
3. Pedido se guarda en `orders` con estado "Pendiente"
4. App Repartidor recibe el pedido en tiempo real
5. Repartidor acepta → Estado cambia a "Asignado"
6. Repartidor marca "En camino" → Estado cambia a "En camino al retiro"
7. Repartidor ingresa código → Estado cambia a "Producto retirado"
8. Repartidor entrega → Estado cambia a "Entregado"

### Autenticación

#### App Empresarial
- Usuario ingresa email y password
- Consulta en `company_users` con filtro `active = true`
- Carga datos relacionados: `companies`, `locals`
- Guarda sesión en `localStorage`

#### App Repartidor
- Repartidor ingresa username y password
- Consulta en `drivers` con filtro `active = true`
- Guarda sesión en `localStorage`

#### Panel Admin
- Superadmin ingresa email y password
- Consulta en `superadmins` con filtro `active = true`
- Guarda sesión en `localStorage`

## Seguridad

### Autenticación

- Autenticación basada en tablas de Supabase
- Validación de usuarios activos (`active = true`)
- Sesiones guardadas en `localStorage`

### Código de Retiro

- Código único de 6 dígitos por pedido
- Generado al crear el pedido
- Validado antes de cambiar estado a "Producto retirado"

**IMPORTANTE**: Las contraseñas en la base de datos deben estar hasheadas. En producción, siempre usa bcrypt o similar.

## Estructura de Archivos

### App Empresarial (`Panelempresa/src/`)

```
Panelempresa/src/
├── App.jsx                    # Componente raíz
├── main.jsx                   # Punto de entrada
├── components/                # Componentes React (presentación)
│   ├── CompanyPanel.jsx       # Panel principal
│   ├── Login.jsx              # Autenticación
│   ├── OrderList.jsx          # Lista de pedidos
│   ├── OrderCard.jsx          # Tarjeta de pedido
│   ├── OrderDetail.jsx        # Detalles del pedido
│   ├── CreateOrderForm.jsx    # Formulario de pedidos
│   ├── ClientManagement.jsx   # Gestión de clientes
│   ├── CreateClientForm.jsx   # Formulario de clientes
│   ├── UserManagement.jsx    # Gestión de usuarios
│   ├── CreateUserForm.jsx     # Formulario de usuarios
│   ├── LocalSettings.jsx      # Configuración de locales
│   ├── CompanyLayout.jsx      # Layout principal
│   └── Modal.jsx              # Modal reutilizable
├── hooks/                     # Hooks personalizados (lógica)
│   ├── useAuth.js
│   ├── useLogin.js
│   ├── useOrders.js
│   ├── useClients.js
│   ├── useUsers.js
│   ├── useLocals.js
│   └── ...
├── services/                   # Servicios (API/Supabase)
│   ├── authService.js
│   ├── orderService.js
│   ├── clientService.js
│   ├── userService.js
│   └── localService.js
├── styles/                     # Estilos CSS
│   ├── globals.css            # Estilos globales
│   ├── layouts/               # Estilos de layouts
│   ├── Components/            # Estilos por componente
│   └── utils/                 # Utilidades CSS
└── utils/                      # Utilidades
    ├── supabase.js            # Cliente de Supabase
    └── utils.js               # Funciones helper
```

Para más detalles sobre la estructura de las otras aplicaciones, consulta:
- `../PanelRepartidor/README.md` - Estructura de App Repartidor
- `../Paneladmin/README.md` - Estructura de Panel Admin

## Convenciones de Código

- Nombres de componentes en PascalCase
- Archivos CSS con mismo nombre que componente
- Funciones helper en `utils/`
- Tipos y estructuras en `types/`
- Estado gestionado con React Hooks (`useState`, `useEffect`, `useCallback`)
- Datos persistentes en `localStorage`
- Sincronización con Supabase en tiempo real

## Responsive Design

- **Desktop**: Layout completo con sidebar visible
- **Tablet**: Sidebar colapsable, ajustes de padding
- **Mobile**: Sidebar como overlay, tabs horizontales, modales desde abajo

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"

```bash
npm install
```

### Error: "VITE_PROJECT_URL is not defined"

Verifica que el archivo `.env` existe y tiene las variables correctas.

### Error: "android platform has not been added yet"

```bash
cd "App Repartidor"
npx cap add android
```

### Error al compilar APK

- Verifica que Android Studio esté instalado
- Verifica que Java JDK esté configurado
- Verifica que Android SDK esté instalado

## Documentación Adicional

- `../ARCHITECTURE.md`: Documentación completa de arquitectura (en la raíz del proyecto)
- `../AGENTS.MD`: Guía para agentes de IA (en la raíz del proyecto)
- `src/README.md`: Documentación de App Empresarial
- `../PanelRepartidor/README.md`: Documentación de App Repartidor
- `../Paneladmin/README.md`: Documentación de Panel Admin
- `Database/README.md`: Documentación de base de datos
- `../CHECKLIST_PRODUCCION.md`: Checklist para producción

## Mejoras Futuras

- [ ] Notificaciones push para repartidores
- [ ] Geolocalización real para asignación de pedidos
- [ ] Sistema de calificaciones
- [ ] Chat entre empresa y repartidor
- [ ] Dashboard con métricas y estadísticas
- [ ] Exportación de reportes
- [ ] Multi-idioma (i18n)

## Recursos

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

## Licencia

[Especificar licencia si aplica]

## Contribución

[Instrucciones de contribución si aplica]

---

**Versión**: 1.0.0  
**Última actualización**: 2024

