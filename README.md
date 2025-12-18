# App Repartidor - Aplicación Móvil para Repartidores

Aplicación móvil para repartidores que permite aceptar pedidos, actualizar estados y gestionar entregas. Disponible como aplicación web y APK Android.

---

## Propósito

Esta aplicación permite a los repartidores:
- Ver pedidos disponibles
- Aceptar pedidos
- Actualizar estado de pedidos
- Validar código de retiro
- Ver pedidos completados
- Gestionar perfil y configuración
- Ver ganancias en billetera

---

## Inicio Rápido

### Requisitos Previos
- Node.js 16+ instalado
- Archivo `.env` configurado con credenciales de Supabase
- Para APK: Android Studio instalado

### Instalación

```bash
# Desde la carpeta App Repartidor
cd "App Repartidor"
npm install
```

### Configuración

Crea un archivo `.env` en la carpeta `App Repartidor/`:

```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu_anon_key_aqui
```

### Desarrollo Web

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5175` (o siguiente puerto disponible)

### Compilación para Web

```bash
npm run build
```

Los archivos compilados estarán en `dist/`

---

## Compilación para APK Android

### Requisitos
- Android Studio instalado
- Java JDK configurado
- Android SDK instalado

### Compilar APK

**Windows:**
```bash
build-apk.bat
```

**Linux/Mac:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

### Pasos Manuales

```bash
# 1. Compilar la aplicación
npm run build

# 2. Sincronizar con Capacitor
npx cap sync

# 3. Abrir Android Studio
npm run cap:open:android
```

### En Android Studio

1. Espera a que Gradle sincronice
2. Ve a: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Estructura del Proyecto

```
App Repartidor/
├── src/
│   ├── App.jsx                  # Componente raíz con lógica principal
│   ├── main.jsx                 # Punto de entrada
│   ├── components/              # Componentes React
│   │   ├── DriverApp.jsx        # Vista principal con pedidos
│   │   ├── Login.jsx            # Autenticación de repartidores
│   │   ├── DriverSidebar.jsx    # Menú lateral de navegación
│   │   ├── OrderList.jsx        # Lista de pedidos
│   │   ├── OrderCard.jsx        # Tarjeta de pedido
│   │   ├── OrderDetail.jsx      # Detalles del pedido
│   │   ├── PickupCodeModal.jsx  # Modal para validar código
│   │   ├── DriverProfile.jsx    # Perfil del repartidor
│   │   ├── DriverWallet.jsx     # Billetera con ganancias
│   │   ├── DriverSettings.jsx   # Configuración
│   │   └── Modal.jsx            # Componente modal reutilizable
│   ├── layouts/                 # Layouts
│   │   └── DriverLayout.jsx     # Layout con header y menú
│   ├── styles/                   # Estilos CSS
│   │   ├── globals.css          # Estilos globales
│   │   ├── layouts/             # Estilos de layouts
│   │   ├── Components/         # Estilos por componente
│   │   └── utils/               # Utilidades CSS
│   ├── types/                    # Tipos y estructuras
│   │   ├── order.js             # Estructura de pedidos
│   │   └── driver.js            # Estructura de repartidores
│   └── utils/                    # Utilidades
│       ├── supabase.js          # Cliente de Supabase
│       ├── utils.js              # Funciones helper
│       └── mockData.js           # Datos de prueba
├── android/                      # Proyecto Android (generado por Capacitor)
├── capacitor.config.json         # Configuración de Capacitor
├── build-apk.bat                 # Script para compilar APK (Windows)
└── package.json                  # Dependencias
```

---

## Autenticación

### Repartidor

Los repartidores se autentican con:
- **Username**: Nombre de usuario del repartidor
- **Password**: Contraseña

La autenticación se realiza contra la tabla `drivers` en Supabase.

**Requisitos**:
- El repartidor debe existir en la tabla `drivers`
- El campo `active` debe ser `true`

---

## Funcionalidades Principales

### 1. Gestión de Pedidos

#### Ver Pedidos Disponibles
- Lista de pedidos con estado "Pendiente"
- Información: cliente, direcciones, precio, local
- Botón para aceptar pedido

#### Mis Pedidos
- Pedidos asignados al repartidor
- Estados: Asignado, En camino, Retirado
- Acciones según estado

#### Pedidos Completados
- Historial de pedidos entregados
- Estadísticas de completados
- Información de ganancias

### 2. Actualizar Estado de Pedidos

#### Flujo de Estados
1. **Aceptar Pedido**: Cambia de "Pendiente" a "Asignado"
2. **En Camino al Retiro**: Cambia a "En camino al retiro"
3. **Retirar Producto**: Requiere código de retiro → Cambia a "Producto retirado"
4. **Entregar**: Cambia a "Entregado"

#### Validación de Código
- Al marcar "Retirar Producto", se solicita código de 6 dígitos
- El código debe coincidir con el del pedido
- Si es correcto, el estado cambia a "Producto retirado"

### 3. Funcionalidades Especiales

#### Timeout Automático
- Los pedidos "Asignado" se revierten a "Pendiente" si no se actualizan en 1 minuto
- Previene que pedidos queden "colgados"

#### Recarga Automática
- Los pedidos se recargan automáticamente cada 30 segundos
- Mantiene la información actualizada

#### Historial de Estados
- Cada cambio de estado se registra en `order_status_history`
- Permite auditoría y seguimiento

### 4. Perfil y Configuración

#### Perfil
- Ver información del repartidor
- Editar datos personales

#### Billetera
- Ver ganancias totales
- Ver ganancias por pedido entregado
- Estadísticas de entregas

#### Configuración
- Ajustes de la aplicación
- Preferencias

---

## Componentes Principales

### DriverApp
Vista principal que contiene:
- Estadísticas (pedidos disponibles, mis pedidos, completados)
- Tabs para diferentes vistas
- Lista de pedidos
- Modal de detalles

### DriverSidebar
Menú lateral con:
- Navegación entre vistas
- Opciones: Pedidos, Completados, Perfil, Billetera, Ajustes
- Cierre de sesión

### PickupCodeModal
Modal para validar código:
- Input numérico de 6 dígitos
- Validación contra código del pedido
- Mensajes de error/éxito

---

## Flujo de Datos

### Carga Inicial
1. Repartidor se autentica
2. Se cargan pedidos disponibles (estado "Pendiente")
3. Se cargan pedidos del repartidor (asignados)
4. Se cargan pedidos completados

### Aceptar Pedido
1. Repartidor hace clic en "Aceptar"
2. Se actualiza `orders` con `driver_id` y estado "Asignado"
3. Se crea registro en `order_status_history`
4. Se recarga la lista

### Actualizar Estado
1. Repartidor selecciona acción
2. Se actualiza `orders` con nuevo estado
3. Se crea registro en `order_status_history`
4. Si es "Retirar", se valida código

### Recarga Automática
- Cada 30 segundos se recargan los pedidos
- Mantiene sincronización con la base de datos

---

## Tablas de Supabase Utilizadas

- `drivers`: Autenticación y información de repartidores
- `orders`: Pedidos (lectura y actualización)
- `order_status_history`: Historial de cambios (crear)
- `clients`: Información de clientes (lectura)
- `locals`: Información de locales (lectura)

---

## Estilos y Diseño

### Responsive Design
- **Mobile First**: Diseñado principalmente para móviles
- **Tablet**: Ajustes de layout
- **Desktop**: Adaptación para pantallas grandes

### Estilos
- CSS Modules por componente
- Estilos globales en `globals.css`
- Utilidades CSS en `utils/`

---

## Configuración de Capacitor

### capacitor.config.json

```json
{
  "appId": "com.deliveryapp.repartidor",
  "appName": "DeliveryApp Repartidor",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```

### Plataforma Android

- **Carpeta**: `android/` (generada automáticamente)
- **Configuración**: Gradle
- **Salida APK**: `android/app/build/outputs/apk/`

---

## Scripts Disponibles

```bash
npm run dev                    # Servidor de desarrollo
npm run build                  # Compilar para web
npm run apk:build              # Compilar y sincronizar para APK
npm run cap:sync               # Sincronizar con Capacitor
npm run cap:open:android       # Abrir Android Studio
npm run lint                   # Linter
```

---

## Notas de Desarrollo

### Convenciones
- Componentes en PascalCase
- Hooks personalizados cuando sea necesario
- Funciones helper en `utils/`
- Tipos y estructuras en `types/`

### Estado Global
- Estado gestionado con React Hooks
- `useState` para estado local
- `useEffect` para efectos secundarios
- `useCallback` para funciones memoizadas

### Variables de Entorno
Asegúrate de tener el archivo `.env` configurado antes de iniciar.

---

## Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Error: "VITE_PROJECT_URL is not defined"
Verifica que el archivo `.env` existe y tiene las variables correctas.

### Error: "android platform has not been added yet"
```bash
npx cap add android
```

### Error al compilar APK
- Verifica que Android Studio esté instalado
- Verifica que Java JDK esté configurado
- Verifica que Android SDK esté instalado

---

## Recursos

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

## Despliegue

### Web
La aplicación web se puede desplegar en cualquier servidor estático o CDN.

### APK
1. Compilar APK en Android Studio
2. Firmar APK para producción
3. Distribuir a repartidores
4. O publicar en Google Play Store

---

**Versión**: 1.0.0  
**Última actualización**: 2024

