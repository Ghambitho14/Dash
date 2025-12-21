@echo off
REM Script para compilar y sincronizar cambios con Android Studio
REM Uso: sync-android.bat
REM Este script compila la app y sincroniza con Capacitor para ver cambios en Android Studio

echo ==========================================
echo Sincronizando cambios con Android Studio
echo ==========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
	echo Error: No se encontro package.json
	echo Asegurate de ejecutar este script desde la carpeta PanelRepartidor
	pause
	exit /b 1
)

echo.
echo Paso 1: Compilando aplicacion...
call npm run build
if errorlevel 1 (
	echo Error al compilar la aplicacion
	pause
	exit /b 1
)

REM Verificar que se creo la carpeta dist
if not exist "dist\index.html" (
	echo Error: El build no genero la carpeta dist correctamente
	pause
	exit /b 1
)

echo.
echo Paso 2: Sincronizando con Capacitor...
call npx cap sync
if errorlevel 1 (
	echo Error al sincronizar con Capacitor
	pause
	exit /b 1
)

echo.
echo ==========================================
echo Sincronizacion completada exitosamente!
echo ==========================================
echo.
echo Los cambios ya estan disponibles en Android Studio.
echo Recuerda hacer "Rebuild Project" en Android Studio si es necesario.
echo.
pause

