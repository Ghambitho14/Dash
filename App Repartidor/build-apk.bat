@echo off
echo ========================================
echo   Compilando App Repartidor para APK
echo ========================================
echo.

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo [2/3] Compilando aplicación...
call npm run build

if errorlevel 1 (
    echo ERROR: La compilación falló
    pause
    exit /b 1
)

echo.
echo Verificando que dist existe...
if not exist "dist\index.html" (
    echo ERROR: La carpeta dist no contiene index.html
    echo La compilación puede haber fallado
    pause
    exit /b 1
)

echo.
echo [3/3] Sincronizando con Capacitor...
echo Verificando configuración de Capacitor...

REM Verificar si la plataforma Android existe
if not exist "android" (
    echo La plataforma Android no existe. Agregándola...
    call npx cap add android
    if errorlevel 1 (
        echo ERROR: No se pudo agregar la plataforma Android
        pause
        exit /b 1
    )
)

call npx cap sync

if errorlevel 1 (
    echo ERROR: La sincronización falló
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ¡Compilación completada!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Abrir Android Studio:
echo    npm run cap:open:android
echo.
echo 2. O abrir manualmente la carpeta 'android' en Android Studio
echo.
echo 3. En Android Studio:
echo    - Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo    - O Build ^> Generate Signed Bundle / APK
echo.
echo El APK estará en:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo ¿Deseas abrir Android Studio ahora? (S/N)
set /p respuesta=
if /i "%respuesta%"=="S" (
    call npm run cap:open:android
)
echo.
pause

