# Guía para Agentes de IA - Sistema de Delivery

Este documento proporciona información esencial para agentes de IA que trabajan en este proyecto.

---

## Información General del Proyecto

### Descripción
Sistema de delivery con tres aplicaciones principales:
1. **DeliveryApp (App Empresarial)**: Aplicación web para empresas (`src/`)
2. **Panel Admin**: Panel de administración web (`Paneladmin/`)
3. **App Repartidor**: Aplicación híbrida web + Android (`App Repartidor/`)

### Stack Tecnológico Principal
- **Frontend**: React 18.2.0 / 19.2.0
- **Build Tool**: Vite 5.0.8 / 7.2.4
- **Base de Datos**: Supabase
- **Mobile**: Capacitor 6.0.0 (solo App Repartidor)
- **Iconos**: Lucide React
- **Estilos**: CSS Modules

---

## Reglas de Desarrollo

### Formato de Código
- **SIEMPRE usar tabulación** para indentación (no espacios)
- Priorizar soluciones simples sobre complejas
- Evitar duplicación de código - buscar código existente antes de crear nuevo
- Mantener la base de código limpia y bien organizada

### Servidores y Pruebas
- **SIEMPRE** matar todos los servidores relacionados antes de iniciar uno nuevo
- Después de cambios, iniciar un nuevo servidor para pruebas
- Verificar que los servidores estén funcionando correctamente

### Iteración vs Creación
- **SIEMPRE** buscar código existente para iterar en lugar de crear desde cero
- Revisar si ya existe lógica o funcionalidad similar antes de implementar
- Eliminar implementaciones anteriores si se introduce un nuevo patrón

### Entornos
- Considerar diferentes entornos: desarrollo, pruebas y producción
- Usar variables de entorno (`.env`) para configuración
- Requeridas: `VITE_PROJECT_URL` y `VITE_ANNON_KEY`

### Cambios y Correcciones
- Hacer solo los cambios solicitados o aquellos con plena confianza
- Al corregir errores, no introducir nuevos patrones sin agotar opciones actuales
- Si se introduce nueva tecnología, eliminar la implementación anterior

### Scripts
- Evitar escribir scripts directamente en archivos si solo se ejecutarán una vez
- Preferir comandos de terminal o scripts temporales

---

## Estructura del Proyecto

```
App/
├── src/                          # DeliveryApp (App Empresarial) - Solo Web
│   ├── components/               # Componentes React (solo UI/presentación)
│   ├── hooks/                    # Hooks personalizados (lógica de negocio)
│   ├── services/                 # Servicios de API (comunicación con Supabase)
│   ├── styles/                   # Estilos CSS
│   │   └── Components/           # Estilos por componente
│   ├── utils/                    # Utilidades y helpers
│   ├── types/                    # Tipos y estructuras
│   ├── App.jsx                   # Componente raíz
│   └── main.jsx                  # Punto de entrada
├── Paneladmin/                   # Panel Admin - Solo Web
├── App Repartidor/               # App Repartidor - Web + APK Android
├── Database/                     # Scripts SQL y documentación
├── server.js                     # Servidor Express unificado
└── package.json                  # Configuración principal
```

---

## Aplicaciones del Sistema

### 1. DeliveryApp (App Empresarial)
- **Ubicación**: `src/`
- **Puerto**: 5173 (desarrollo)
- **Propósito**: Gestión de pedidos, clientes, usuarios y locales
- **Componentes clave**: `CompanyPanel.jsx`, `Login.jsx`, `OrderList.jsx`, `CreateOrderForm.jsx`, `CompanyLayout.jsx`
- **Hooks personalizados**: 
  - `useCompanyPanel.js` - Lógica del panel principal
  - `useLogin.js` - Lógica de autenticación
  - `useCreateOrderForm.js` - Lógica del formulario de pedidos
  - `useClientManagement.js` - Lógica de gestión de clientes
  - `useCreateUserForm.js` - Lógica del formulario de usuarios
  - `useUserManagement.js` - Lógica de gestión de usuarios
  - `useLocalSettings.js` - Lógica de configuración de locales
  - `useCreateClientForm.js` - Lógica del formulario de clientes
  - `useAuth.js`, `useOrders.js`, `useClients.js`, `useUsers.js`, `useLocals.js` - Hooks de datos

### 2. Panel Admin
- **Ubicación**: `Paneladmin/`
- **Puerto**: 5174 (desarrollo)
- **Propósito**: Crear empresas, repartidores y usuarios empresariales
- **Componentes clave**: `Dashboard.jsx`, `Login.jsx`

### 3. App Repartidor
- **Ubicación**: `App Repartidor/`
- **Puerto**: 5175 (desarrollo)
- **Propósito**: Aceptar pedidos, actualizar estados, gestionar entregas
- **Componentes clave**: `DriverApp.jsx`, `Login.jsx`, `OrderList.jsx`, `PickupCodeModal.jsx`
- **Compilación APK**: Usar `build-apk.bat` (Windows) o `build-apk.sh` (Linux/Mac)

---

## Base de Datos (Supabase)

### Tablas Principales
- `companies`: Información de empresas
- `company_users`: Usuarios de empresas (roles: `empresarial`, `admin`, `local`)
- `drivers`: Repartidores
- `locals`: Locales/sucursales
- `clients`: Clientes
- `orders`: Pedidos (estados: Pendiente, Asignado, En camino al retiro, Producto retirado, Entregado)
- `order_status_history`: Historial de cambios de estado
- `superadmins`: Superadministradores

### Estados de Pedidos
1. **Pendiente** → Pedido creado, sin asignar
2. **Asignado** → Repartidor aceptó el pedido
3. **En camino al retiro** → Repartidor yendo a retirar
4. **Producto retirado** → Repartidor retiró (requiere código de 6 dígitos)
5. **Entregado** → Pedido completado

---

## Convenciones de Código

### Nomenclatura
- Componentes: PascalCase (`CompanyPanel.jsx`)
- Archivos CSS: Mismo nombre que componente (`CompanyPanel.css`)
- Funciones helper: En `utils/`
- Tipos y estructuras: En `types/`

### Estilos
- CSS Modules por componente
- Estilos globales en `styles/globals.css`
- Utilidades CSS en `styles/utils/`
- Responsive: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px)

### Componentes
- Componentes funcionales con Hooks
- **Separación de lógica y presentación**: Los componentes solo manejan UI, la lógica está en hooks personalizados
- Componentes reutilizables (Modal, OrderCard, etc.)
- Estado gestionado con React Hooks (`useState`, `useEffect`, `useCallback`)

### Arquitectura de Componentes
- **Componentes (`components/`)**: Solo contienen JSX/HTML y renderizado
- **Hooks (`hooks/`)**: Contienen toda la lógica de negocio, estado y efectos
- **Servicios (`services/`)**: Manejan comunicación con API/Supabase
- **Patrón**: Componente → Hook → Servicio → Supabase

---

## Flujos Importantes

### Creación de Pedido
1. Usuario crea pedido en `CreateOrderForm`
2. Se genera código de retiro único (6 dígitos)
3. Pedido se guarda con estado "Pendiente"
4. App Repartidor recibe en tiempo real
5. Repartidor acepta → "Asignado"
6. Repartidor marca "En camino" → "En camino al retiro"
7. Repartidor ingresa código → "Producto retirado"
8. Repartidor entrega → "Entregado"

### Autenticación
- **App Empresarial**: Consulta `company_users` con `active = true`
- **App Repartidor**: Consulta `drivers` con `active = true`
- **Panel Admin**: Consulta `superadmins` con `active = true`
- Sesiones guardadas en `localStorage`

---

## Comandos Útiles

### Desarrollo
```bash
# App Empresarial
cd src
npm run dev          # Puerto 5173

# Panel Admin
cd Paneladmin
npm run dev          # Puerto 5174

# App Repartidor
cd "App Repartidor"
npm run dev          # Puerto 5175
```

### Producción
```bash
# Compilar todas las apps
npm run build:all

# Iniciar servidor unificado
npm run start
npm run start:prod   # Compila y inicia
```

### App Repartidor - APK
```bash
cd "App Repartidor"
build-apk.bat        # Windows
build-apk.sh         # Linux/Mac
npm run cap:open:android  # Abre Android Studio
```

---

## Archivos de Referencia

- `ARCHITECTURE.md`: Documentación completa de arquitectura
- `Database/README.md`: Documentación de base de datos
- `User.md`: Información de usuarios

---

## Notas Importantes

- **Timeout automático**: Pedidos "Asignado" se revierten a "Pendiente" si no se actualizan en 1 minuto (App Repartidor)
- **Recarga periódica**: Pedidos se recargan automáticamente cada 30 segundos (App Repartidor)
- **Código de retiro**: Código único de 6 dígitos generado al crear pedido, validado antes de cambiar a "Producto retirado"
- **Servidor unificado**: `server.js` sirve DeliveryApp en `/` y Panel Admin en `/admin`
- **Separación de lógica**: Todos los componentes principales tienen su lógica extraída a hooks personalizados en `hooks/`
- **Estructura simplificada**: La carpeta `layouts/` fue eliminada, `CompanyLayout.jsx` ahora está en `components/`

---

## Hooks Personalizados Disponibles

### Hooks de Lógica de Componentes
- `useCompanyPanel` - Maneja estado, filtros y acciones del panel principal
- `useLogin` - Maneja autenticación y validación de credenciales
- `useCreateOrderForm` - Maneja formulario de creación de pedidos
- `useClientManagement` - Maneja gestión de clientes
- `useCreateUserForm` - Maneja formulario de creación/edición de usuarios
- `useUserManagement` - Maneja gestión de usuarios
- `useLocalSettings` - Maneja configuración de locales
- `useCreateClientForm` - Maneja formulario de creación/edición de clientes

### Hooks de Datos
- `useAuth` - Gestiona autenticación y sesión de usuario
- `useOrders` - Gestiona pedidos (carga, creación, eliminación)
- `useClients` - Gestiona clientes (CRUD)
- `useUsers` - Gestiona usuarios empresariales (CRUD)
- `useLocals` - Gestiona locales/sucursales (CRUD)

---

**Última actualización**: 2024

