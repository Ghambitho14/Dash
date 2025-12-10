# Solución de Errores en Android Studio

## Error 1: "Using flatDir should be avoided"

**Explicación:**
Este es un **warning** (no un error crítico) que aparece porque Capacitor/Cordova usa `flatDir` para cargar plugins. Es común en proyectos híbridos.

**Solución:**
- ✅ Ya está configurado para suprimir el warning
- ✅ **No impide la compilación del APK**
- Puedes ignorarlo de forma segura

## Error 2: "SDK XML version 4 was encountered"

**Explicación:**
Este error indica una incompatibilidad entre la versión de Android Studio y las herramientas de línea de comandos del SDK.

**Soluciones:**

### Opción 1: Actualizar Android Studio (Recomendado)
1. Abre Android Studio
2. Ve a: **Help > Check for Updates**
3. Actualiza Android Studio a la última versión
4. También actualiza el SDK: **Tools > SDK Manager > SDK Tools**

### Opción 2: Sincronizar Gradle
1. En Android Studio: **File > Sync Project with Gradle Files**
2. Espera a que termine la sincronización

### Opción 3: Limpiar y Reconstruir
1. **Build > Clean Project**
2. **Build > Rebuild Project**

### Opción 4: Actualizar SDK Tools
1. **Tools > SDK Manager**
2. En la pestaña **SDK Tools**:
   - Marca "Show Package Details"
   - Actualiza "Android SDK Build-Tools"
   - Actualiza "Android SDK Command-line Tools"
3. Aplica los cambios

### Opción 5: Si el error persiste
El error puede ser solo un warning y no impedir la compilación. Intenta generar el APK de todas formas:
- **Build > Build Bundle(s) / APK(s) > Build APK(s)**

## Notas Importantes

- Estos errores **NO deberían impedir** generar el APK
- Si puedes compilar el APK, los warnings se pueden ignorar
- Los cambios en `gradle.properties` ayudan a suprimir warnings

## Verificar que Funciona

1. Intenta compilar el APK: **Build > Build APK(s)**
2. Si se genera exitosamente, los warnings no son críticos
3. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

