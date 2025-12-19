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

### Estados de Pedidos

1. **Pendiente**: Pedido creado, sin asignar
2. **Asignado**: Repartidor aceptó el pedido
3. **En camino al retiro**: Repartidor yendo a retirar
4. **Producto retirado**: Repartidor retiró (requiere código de 6 dígitos)
5. **Entregado**: Pedido completado

---

## Flujos Principales
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


