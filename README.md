# Sistema de Delivery - Aplicación Completa

Sistema completo de gestión de delivery con tres aplicaciones integradas: aplicación empresarial para gestión de pedidos, panel de administración para superadministradores, y aplicación móvil para repartidores.

---

## Descripción General

Este proyecto es un sistema multi-aplicación para la gestión de pedidos de delivery que incluye:

1. **Panelempresa (App Empresarial)**: Aplicación web para empresas y administradores locales
2. **Paneladmin (Panel Admin)**: Panel de administración para superadministradores
3. **PanelRepartidor (App Repartidor)**: Aplicación móvil (web + APK Android) para repartidores

Todas las aplicaciones están integradas con Supabase como base de datos y backend.

---

## Estructura del Proyecto

```
App/
├── Panelempresa/              # App Empresarial - Solo Web
│   ├── src/                   # Código fuente
│   ├── Database/              # Scripts SQL y documentación
│   └── README.md              # Documentación específica
├── Paneladmin/                # Panel Admin - Solo Web
│   ├── src/                   # Código fuente
│   └── README.md              # Documentación específica
├── PanelRepartidor/           # App Repartidor - Web + APK Android
│   ├── src/                   # Código fuente
│   ├── android/               # Proyecto Android (Capacitor)
│   └── README.md              # Documentación específica
├── ARCHITECTURE.md            # Documentación completa de arquitectura
├── AGENTS.MD                  # Guía para agentes de IA
├── DEPLOY_AWS.md              # Guía de despliegue en AWS
├── CHECKLIST_COMPLETAR_APPS.md  # Checklist para completar apps
└── README.md                  # Este archivo
```

---

## Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- Cuenta de Supabase configurada
- Para compilar APK: Android Studio instalado (solo PanelRepartidor)

---

## Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd App
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en cada carpeta de aplicación:

**Panelempresa/.env:**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu-anon-key
```

**Paneladmin/.env:**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu-anon-key
```

**PanelRepartidor/.env:**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu-anon-key
VITE_API_KEY_MAPS=tu-google-maps-api-key (opcional)
```

### 3. Instalar dependencias

```bash
# App Empresarial
cd Panelempresa
npm install

# Panel Admin
cd ../Paneladmin
npm install

# App Repartidor
cd ../PanelRepartidor
npm install
```

### 4. Configurar base de datos

Ejecuta los scripts SQL en Supabase (en orden):
- `Panelempresa/Database/01_create_database_supabase.sql`
- `Panelempresa/Database/02_insert_initial_data.sql`
- `Panelempresa/Database/04_create_driver_locations_table.sql`
- `Panelempresa/Database/05_create_registration_requests_table.sql`

---

## Desarrollo

### App Empresarial (Panelempresa)

```bash
cd Panelempresa
npm run dev
```

Disponible en: `http://localhost:5173`

### Panel Admin (Paneladmin)

```bash
cd Paneladmin
npm run dev
```

Disponible en: `http://localhost:5174`

### App Repartidor (PanelRepartidor)

```bash
cd PanelRepartidor
npm run dev
```

Disponible en: `http://localhost:5175`

---

## Compilación para Producción

### App Empresarial

```bash
cd Panelempresa
npm run build
```

Archivos compilados en: `Panelempresa/dist/`

### Panel Admin

```bash
cd Paneladmin
npm run build
```

Archivos compilados en: `Paneladmin/dist/`

### App Repartidor

**Para Web:**
```bash
cd PanelRepartidor
npm run build
```

**Para APK Android:**
```bash
cd PanelRepartidor
build-apk.bat  # Windows
# o
npm run build && npx cap sync
npm run cap:open:android
```

---

## Aplicaciones del Sistema

### 1. Panelempresa (App Empresarial)

**Propósito**: Gestión de pedidos, clientes, usuarios y locales para empresas

**Funcionalidades**:
- Crear y gestionar pedidos
- Gestionar clientes (CRUD)
- Gestionar usuarios empresariales (CRUD)
- Configurar locales/sucursales
- Ver pedidos en tiempo real (Supabase Realtime)
- Tracking de repartidores en mapa

**Roles de Usuario**:
- `empresarial`: Acceso completo
- `admin`: Administrador con permisos extendidos
- `local`: Usuario de local específico, acceso limitado

**Puerto Desarrollo**: 5173

---

### 2. Paneladmin (Panel Admin)

**Propósito**: Panel de administración para superadministradores

**Funcionalidades**:
- Crear empresas
- Crear repartidores
- Crear usuarios empresariales automáticamente al crear empresa
- Gestionar solicitudes de registro
- Ver ubicaciones de repartidores en tiempo real

**Puerto Desarrollo**: 5174

---

### 3. PanelRepartidor (App Repartidor)

**Propósito**: Aplicación móvil para repartidores

**Funcionalidades**:
- Ver pedidos disponibles
- Aceptar pedidos
- Actualizar estado de pedidos
- Validar código de retiro (6 dígitos)
- Tracking de ubicación GPS en tiempo real
- Ver pedidos completados y ganancias
- Gestionar perfil

**Plataformas**:
- Web (navegador)
- APK Android (compilado con Capacitor)

**Puerto Desarrollo**: 5175

---

## Stack Tecnológico

### Frontend
- **React**: 18.2.0 / 19.2.0
- **Vite**: 5.0.8 / 7.2.4
- **Lucide React**: Iconos
- **react-hot-toast**: Notificaciones

### Backend y Base de Datos
- **Supabase**: Base de datos PostgreSQL y backend
- **Supabase Realtime**: Actualizaciones en tiempo real

### Mobile (solo PanelRepartidor)
- **Capacitor**: 6.0.0
- **@capacitor/geolocation**: Tracking GPS
- **@capacitor/preferences**: Almacenamiento persistente

### Seguridad
- **bcryptjs**: Hashing de contraseñas
- Autenticación basada en tablas de Supabase

---

## Base de Datos (Supabase)

### Tablas Principales

- `companies`: Información de empresas
- `company_users`: Usuarios de empresas (roles: empresarial, admin, local)
- `drivers`: Repartidores
- `locals`: Locales/sucursales
- `clients`: Clientes
- `orders`: Pedidos
- `order_status_history`: Historial de cambios de estado
- `driver_locations`: Ubicaciones GPS de repartidores
- `superadmins`: Superadministradores
- `driver_registration_requests`: Solicitudes de registro de repartidores
- `company_registration_requests`: Solicitudes de registro de empresas

### Estados de Pedidos

1. **Pendiente**: Pedido creado, sin asignar
2. **Asignado**: Repartidor aceptó el pedido
3. **En camino al retiro**: Repartidor yendo a retirar
4. **Producto retirado**: Repartidor retiró (requiere código de 6 dígitos)
5. **Entregado**: Pedido completado

---

## Flujos Principales

### Flujo de Creación de Pedido

1. Usuario empresarial crea pedido en Panelempresa
2. Se genera código de retiro único (6 dígitos)
3. Pedido se guarda con estado "Pendiente"
4. PanelRepartidor recibe el pedido en tiempo real (Supabase Realtime)
5. Repartidor acepta → Estado cambia a "Asignado"
6. Repartidor marca "En camino" → Estado cambia a "En camino al retiro"
7. Repartidor ingresa código → Estado cambia a "Producto retirado"
8. Repartidor entrega → Estado cambia a "Entregado"

### Flujo de Autenticación

**Panelempresa**: Consulta `company_users` con `active = true`
**Paneladmin**: Consulta `superadmins` con `active = true`
**PanelRepartidor**: Consulta `drivers` con `active = true`

Las sesiones se guardan en:
- **Web**: localStorage
- **Android**: Capacitor Preferences (persistente)

---

## Despliegue

### Opciones de Despliegue

1. **AWS Amplify** (Recomendado para empezar)
   - CI/CD automático
   - HTTPS automático
   - Ver `DEPLOY_AWS.md` para detalles

2. **S3 + CloudFront** (Más control)
   - Más económico a gran escala
   - Ver `DEPLOY_AWS.md` para detalles

3. **EC2 + Nginx** (Control total)
   - Control completo del servidor
   - HTTPS con Let's Encrypt
   - Ver `DEPLOY_AWS.md` para detalles

### Variables de Entorno en Producción

Las variables `VITE_*` se inyectan en **build time**, no runtime.

**Opción A: Archivo .env.production**
```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu-anon-key
```

**Opción B: Variables en plataforma de despliegue**
- AWS Amplify: Environment variables
- S3/EC2: Variables antes de `npm run build`

---

## Scripts Disponibles

### Panelempresa
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Preview de build
npm run lint         # Linter
```

### Paneladmin
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Preview de build
npm run lint         # Linter
```

### PanelRepartidor
```bash
npm run dev                    # Servidor de desarrollo
npm run build                  # Compilar para web
npm run cap:sync               # Sincronizar con Capacitor
npm run cap:open:android       # Abrir Android Studio
build-apk.bat                  # Compilar APK (Windows)
```

---

## Arquitectura

### Separación de Responsabilidades

- **Componentes** (`components/`): Solo UI/presentación
- **Hooks** (`hooks/`): Lógica de negocio y estado
- **Servicios** (`services/`): Comunicación con Supabase
- **Utils** (`utils/`): Funciones helper

### Flujo de Datos

```
Componente → Hook → Servicio → Supabase
     ↑                           ↓
     └────────── Estado ─────────┘
```

---

## Seguridad

### Contraseñas

- Las contraseñas se hashean con bcrypt antes de guardar
- Verificación con bcrypt.compare
- En producción, se rechazan contraseñas en texto plano

### Autenticación

- Autenticación basada en tablas de Supabase
- Validación de usuarios activos (`active = true`)
- Sesiones guardadas localmente (localStorage o Capacitor Preferences)

### Código de Retiro

- Código único de 6 dígitos por pedido
- Generado al crear el pedido
- Validado antes de cambiar estado a "Producto retirado"

---

## Sincronización en Tiempo Real

### PanelRepartidor
- Supabase Realtime implementado
- Canal: `orders-company-{companyId}`
- Fallback: Polling cada 60 segundos

### Panelempresa
- Supabase Realtime implementado
- Canal: `orders-company-{companyId}`
- Fallback: Polling cada 60 segundos

### Paneladmin
- Supabase Realtime para ubicaciones de repartidores
- Actualizaciones en tiempo real de solicitudes

---

## Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Error: "VITE_PROJECT_URL is not defined"
Verifica que el archivo `.env` existe y tiene las variables correctas.

### Error de autenticación
Verifica que:
- El usuario exista en la tabla correspondiente
- El campo `active` sea `true`
- Las credenciales sean correctas

### Error al compilar APK
- Verifica que Android Studio esté instalado
- Verifica que Java JDK esté configurado
- Verifica que Android SDK esté instalado
- Ejecuta: `npx cap sync`

---

## Documentación Adicional

- `ARCHITECTURE.md`: Documentación completa de arquitectura
- `AGENTS.MD`: Guía para agentes de IA trabajando en el proyecto
- `DEPLOY_AWS.md`: Guía completa de despliegue en AWS
- `CHECKLIST_COMPLETAR_APPS.md`: Checklist para completar apps
- `Panelempresa/README.md`: Documentación de App Empresarial
- `Panelempresa/Database/README.md`: Documentación de base de datos
- `Paneladmin/README.md`: Documentación de Panel Admin
- `PanelRepartidor/README.md`: Documentación de App Repartidor

---

## Mejoras Futuras

### Funcionalidades
- Notificaciones push para repartidores
- Sistema de calificaciones
- Chat entre empresa y repartidor
- Dashboard con métricas y estadísticas
- Exportación de reportes
- Multi-idioma (i18n)

### Técnicas
- Error Boundaries de React
- Optimización de componentes (React.memo, useMemo)
- Testing (unitario, integración, E2E)
- Migración gradual a TypeScript

---

## Convenciones de Código

- **Indentación**: Tabulación (no espacios)
- **Componentes**: PascalCase (`CompanyPanel.jsx`)
- **Hooks**: Prefijo `use` (`useAuth.js`)
- **Servicios**: Sufijo `Service` (`authService.js`)
- **Estilos**: CSS Modules por componente
- **Nombres de archivos**: Mismo nombre que componente

---

## Licencia

[Especificar licencia si aplica]

---

## Contacto y Soporte

[Información de contacto si aplica]

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024

