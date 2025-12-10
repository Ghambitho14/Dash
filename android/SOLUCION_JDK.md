# Solución: Error de Configuración de JDK

## Error
```
Invalid Gradle JDK configuration found.
Undefined jdk.table.xml entry with the name:jbr-17
```

## Solución Rápida

### Opción 1: Configurar JDK en Android Studio (Recomendado)

1. Abre Android Studio
2. Ve a: **File > Settings** (o **File > Project Structure**)
3. Navega a: **Build, Execution, Deployment > Build Tools > Gradle**
4. En "Gradle JDK", selecciona:
   - **JDK 17** (si está disponible)
   - O **Embedded JDK** (JDK incluido con Android Studio)
   - O **Project SDK** (el SDK del proyecto)
5. Haz clic en **Apply** y luego **OK**
6. Sincroniza: **File > Sync Project with Gradle Files**

### Opción 2: Usar el JDK del Sistema

1. En Android Studio: **File > Settings > Build, Execution, Deployment > Build Tools > Gradle**
2. En "Gradle JDK", selecciona: **Download JDK...**
3. Elige **Version 17** y haz clic en **Download**
4. Una vez descargado, selecciónalo y haz clic en **Apply**

### Opción 3: Verificar JAVA_HOME

Si tienes Java instalado en tu sistema:

1. Verifica que JAVA_HOME esté configurado:
   ```powershell
   echo $env:JAVA_HOME
   ```

2. Si no está configurado, configúralo:
   - Busca dónde está instalado Java (normalmente en `C:\Program Files\Java\`)
   - Configura la variable de entorno JAVA_HOME

3. En Android Studio, selecciona ese JDK en la configuración de Gradle

## Verificación

Después de configurar el JDK:

1. **File > Sync Project with Gradle Files**
2. Espera a que termine la sincronización
3. Intenta compilar: **Build > Build APK(s)**

## Nota

El archivo `.idea/gradle.xml` ya está configurado para usar `#JAVA_HOME`, pero Android Studio necesita que el JDK esté configurado en sus preferencias.

