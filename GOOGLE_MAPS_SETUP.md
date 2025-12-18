# Configuración de Google Maps API

## APIs Necesarias

Para que la aplicación funcione correctamente, necesitas habilitar las siguientes APIs en Google Cloud Console:

### 1. Maps JavaScript API (OBLIGATORIA)
- **Uso**: Mostrar mapas interactivos
- **Cómo habilitar**: 
  1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
  2. Selecciona tu proyecto
  3. Ve a **APIs y servicios** > **Biblioteca**
  4. Busca "Maps JavaScript API"
  5. Haz clic en **Habilitar**

### 2. Geocoding API (OBLIGATORIA)
- **Uso**: Convertir direcciones en coordenadas (lat/lng)
- **Cómo habilitar**:
  1. En la misma biblioteca, busca "Geocoding API"
  2. Haz clic en **Habilitar**

### 3. Directions API (RECOMENDADA)
- **Uso**: Calcular rutas entre puntos
- **Cómo habilitar**:
  1. Busca "Directions API" en la biblioteca
  2. Haz clic en **Habilitar**

## Crear Clave de API

1. Ve a **APIs y servicios** > **Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES** > **Clave de API**
3. Se creará una clave nueva
4. Haz clic en la clave para editarla

## Configurar Restricciones de la Clave

### Restricciones de aplicación (IMPORTANTE)

1. En **Restricciones de aplicación**, selecciona **Sitios web (referrers)**
2. Agrega estas URLs para desarrollo:
   ```
   http://localhost:5173/*
   http://localhost:5173
   http://127.0.0.1:5173/*
   http://127.0.0.1:5173
   ```

3. Para producción, agrega tu dominio:
   ```
   https://tudominio.com/*
   https://www.tudominio.com/*
   ```

### Restricciones de API

1. En **Restricciones de API**, selecciona **Restringir clave**
2. Selecciona estas APIs:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API
   - ✅ Directions API

## Configurar en el Proyecto

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega tu clave de API:
   ```
   VITE_API_KEY_MAPS=tu_clave_de_api_aqui
   ```

3. Reinicia el servidor de desarrollo

## Habilitar Facturación

⚠️ **IMPORTANTE**: Google Maps requiere facturación habilitada, aunque tengas créditos gratuitos.

1. Ve a **Facturación** en Google Cloud Console
2. Vincula una cuenta de facturación
3. Google ofrece $200 USD en créditos gratuitos mensuales

## Límites Gratuitos (Créditos Mensuales)

- **Maps JavaScript API**: $200 USD/mes (suficiente para ~28,000 cargas de mapa)
- **Geocoding API**: $200 USD/mes (suficiente para ~40,000 geocodificaciones)
- **Directions API**: $200 USD/mes (suficiente para ~40,000 solicitudes)

## Verificar que Todo Funciona

1. Abre la aplicación en `http://localhost:5173`
2. Abre la consola del navegador (F12)
3. No deberías ver errores de `RefererNotAllowedMapError`
4. Los mapas deberían cargar correctamente

## Solución de Problemas

### Error: RefererNotAllowedMapError
- **Causa**: La URL no está autorizada en las restricciones
- **Solución**: Agrega `http://localhost:5173/*` a las restricciones de referrers

### Error: ApiNotActivatedMapError
- **Causa**: La API no está habilitada
- **Solución**: Habilita Maps JavaScript API en la consola

### Error: BillingNotEnabledMapError
- **Causa**: La facturación no está habilitada
- **Solución**: Vincula una cuenta de facturación en Google Cloud

### Error: InvalidKeyMapError
- **Causa**: La clave de API no es válida
- **Solución**: Verifica que `VITE_API_KEY_MAPS` esté correctamente configurada en `.env`

