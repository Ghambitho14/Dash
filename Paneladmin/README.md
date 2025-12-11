# Panel Admin - Panel de Administración

Panel de administración para superadministradores. Permite gestionar empresas, repartidores y crear usuarios empresariales.

---

## Propósito

Esta aplicación permite a los superadministradores:
- Crear nuevas empresas
- Crear repartidores
- Crear usuarios empresariales automáticamente al crear empresas
- Gestionar el sistema completo

---

## Inicio Rápido

### Requisitos Previos
- Node.js 16+ instalado
- Archivo `.env` configurado con credenciales de Supabase

### Instalación

```bash
# Desde la carpeta Paneladmin
cd Paneladmin
npm install
```

### Configuración

Crea un archivo `.env` en la carpeta `Paneladmin/`:

```env
VITE_PROJECT_URL=https://tu-proyecto.supabase.co
VITE_ANNON_KEY=tu_anon_key_aqui
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5174` (o siguiente puerto disponible)

### Compilación para Producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/`

---

## Estructura del Proyecto

```
Paneladmin/
├── src/
│   ├── App.jsx                 # Componente raíz
│   ├── main.jsx                # Punto de entrada
│   ├── components/             # Componentes React
│   │   ├── Dashboard.jsx       # Panel principal con gestión
│   │   └── Login.jsx           # Autenticación de superadmin
│   ├── style/                  # Estilos CSS
│   │   ├── App.css             # Estilos de la app
│   │   ├── Dashboard.css       # Estilos del dashboard
│   │   ├── Login.css           # Estilos del login
│   │   └── index.css           # Estilos globales
│   └── utils/                  # Utilidades
│       └── supabase.js          # Cliente de Supabase
├── public/                     # Archivos públicos
└── package.json                # Dependencias
```

---

## Autenticación

### Superadministrador

Los superadministradores se autentican con:
- **Email**: Correo electrónico del superadmin
- **Password**: Contraseña

La autenticación se realiza contra la tabla `superadmins` en Supabase.

**Requisitos**:
- El usuario debe existir en la tabla `superadmins`
- El campo `active` debe ser `true`

---

## Funcionalidades Principales

### 1. Crear Empresa

Al crear una empresa:
1. Se ingresa el nombre de la empresa
2. Se crea el registro en la tabla `companies`
3. **Automáticamente** se crea un usuario empresarial:
   - Email: `admin@[nombre-empresa].com` (formato sugerido)
   - Password: Generada o definida
   - Rol: `empresarial`
   - Vinculado a la empresa creada

### 2. Crear Repartidor

Al crear un repartidor:
1. Se ingresa nombre de usuario
2. Se ingresa contraseña
3. Se asigna a una empresa (opcional)
4. Se crea el registro en la tabla `drivers`
5. El repartidor puede usar la App Repartidor

### 3. Gestión

- Ver lista de empresas
- Ver lista de repartidores
- Crear nuevas empresas y repartidores
- Los usuarios empresariales se crean automáticamente

---

## Tablas de Supabase Utilizadas

- `superadmins`: Autenticación de superadministradores
- `companies`: Gestión de empresas (CRUD)
- `company_users`: Creación de usuarios empresariales
- `drivers`: Gestión de repartidores (CRUD)

---

## Componentes Principales

### Dashboard
Panel principal que contiene:
- Tabs para empresas y repartidores
- Formularios para crear nuevas entidades
- Lista de empresas y repartidores existentes
- Acciones de gestión

### Login
Formulario de autenticación:
- Validación de credenciales
- Manejo de errores
- Redirección al dashboard

---

## Flujo de Datos

### Carga Inicial
1. Superadmin se autentica
2. Se cargan todas las empresas (`companies`)
3. Se cargan todos los repartidores (`drivers`)

### Crear Empresa
1. Se crea registro en `companies`
2. Se crea automáticamente usuario en `company_users` con rol `empresarial`
3. Se actualiza la lista

### Crear Repartidor
1. Se crea registro en `drivers`
2. Se asigna a empresa (opcional)
3. Se actualiza la lista

---

## Estilos y Diseño

### Responsive Design
- **Desktop**: Layout completo con tabs
- **Tablet**: Ajustes de padding y tamaños
- **Mobile**: Tabs horizontales, formularios adaptados

### Estilos
- CSS por componente
- Estilos globales en `index.css`
- Diseño moderno y limpio

---

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Preview de build
npm run lint         # Linter
```

---

## Notas de Desarrollo

### Convenciones
- Componentes funcionales con Hooks
- Estado local con `useState`
- Efectos con `useEffect`

### Variables de Entorno
Asegúrate de tener el archivo `.env` configurado antes de iniciar.

---

## Integración con Otras Apps

### App Empresarial
Al crear una empresa, se crea automáticamente un usuario que puede acceder a la App Empresarial.

### App Repartidor
Los repartidores creados pueden usar la App Repartidor para gestionar pedidos.

---

## Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Error: "VITE_PROJECT_URL is not defined"
Verifica que el archivo `.env` existe en `Paneladmin/` y tiene las variables correctas.

### Error de autenticación
Verifica que:
- El superadmin exista en la tabla `superadmins`
- El campo `active` sea `true`
- Las credenciales sean correctas

---

## Recursos

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

## Despliegue

### Servidor Unificado

Esta aplicación se sirve junto con la App Empresarial en el servidor unificado:

- **URL**: `http://localhost:3000/admin`
- **Compilación**: `cd Paneladmin && npm run build`
- **Servidor**: Ver `server.js` en la raíz del proyecto

---

**Versión**: 1.0.0  
**Última actualización**: 2024

