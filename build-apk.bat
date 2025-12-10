@echo off
echo Construyendo la aplicacion...
call npm run build

echo Sincronizando con Capacitor...
call npx cap sync

echo.
echo ¡Listo! Ahora puedes:
echo 1. Abrir Android Studio: npm run cap:open:android
echo 2. O abrir manualmente la carpeta 'android' en Android Studio
echo 3. En Android Studio: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo.
echo El APK estara en: android\app\build\outputs\apk\debug\app-debug.apk

