# Cómo Suprimir el Warning de flatDir

## El Warning

```
Using flatDir should be avoided because it doesn't support any meta-data formats.
```

## ¿Por qué aparece?

Este warning aparece porque Capacitor/Cordova usa `flatDir` para cargar plugins nativos. Es una limitación conocida de estos frameworks.

## ¿Es un problema?

**NO**. Este es solo un **warning**, no un error. No impide:
- ✅ Compilar el APK
- ✅ Ejecutar la aplicación
- ✅ Usar los plugins de Capacitor

## Soluciones Implementadas

Ya se han aplicado varias configuraciones para minimizar este warning:

1. **gradle.properties**: Configuraciones para suprimir warnings
2. **build.gradle**: Configuraciones de lint y compilación
3. **Comentarios**: Explicaciones en el código

## Si el Warning Persiste

### Opción 1: Ignorarlo (Recomendado)
El warning es seguro de ignorar. Puedes continuar compilando el APK normalmente.

### Opción 2: Suprimir en Android Studio
1. Ve a: **File > Settings > Editor > Inspections**
2. Busca: "Gradle"
3. Desactiva: "Deprecated API usage" o "Unstable API usage"

### Opción 3: Filtrar en la consola
En Android Studio, puedes filtrar los warnings en la pestaña "Build" para no verlos.

## Verificación

Para verificar que todo funciona:
1. Compila el APK: **Build > Build APK(s)**
2. Si se genera exitosamente, el warning no es un problema
3. Instala el APK en un dispositivo y prueba la app

## Conclusión

Este warning es **cosmético** y no afecta la funcionalidad. Es común en proyectos Capacitor/Cordova y puede ser ignorado de forma segura.

