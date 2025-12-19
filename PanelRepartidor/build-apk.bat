@echo off
REM Script para compilar APK de PanelRepartidor
REM Uso: build-apk.bat

echo ==========================================
echo Compilando APK - PanelRepartidor
echo ==========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
	echo Error: No se encontro package.json
	echo Asegurate de ejecutar este script desde la carpeta PanelRepartidor
	pause
	exit /b 1
)

REM Verificar variables de entorno
if not exist ".env" (
	echo.
	echo ADVERTENCIA: No se encontro archivo .env
	echo Las variables de entorno deben estar configuradas antes del build
	echo.
	echo Crear archivo .env con:
	echo   VITE_PROJECT_URL=https://tu-proyecto.supabase.co
	echo   VITE_ANNON_KEY=tu-anon-key
	echo.
	set /p continuar="Continuar de todos modos? (S/N): "
	if /i not "%continuar%"=="S" (
		exit /b 1
	)
)

echo.
echo Paso 1: Instalando dependencias...
call npm install
if errorlevel 1 (
	echo Error al instalar dependencias
	pause
	exit /b 1
)

echo.
echo Paso 2: Compilando aplicacion...
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
echo Paso 3: Sincronizando con Capacitor...
call npx cap sync
if errorlevel 1 (
	echo Error al sincronizar con Capacitor
	pause
	exit /b 1
)

echo.
echo ==========================================
echo Compilacion completada exitosamente!
echo ==========================================
echo.

REM Intentar abrir Android Studio automaticamente
echo Intentando abrir Android Studio...
call npx cap open android
if errorlevel 1 (
	echo.
	echo No se pudo abrir Android Studio automaticamente.
	echo.
	echo Abre Android Studio manualmente:
	echo   1. Abre Android Studio
	echo   2. File ^> Open
	echo   3. Selecciona la carpeta: %CD%\android
	echo   4. Espera a que Gradle sincronice
	echo   5. Ve a: Build ^> Build Bundle(s^) / APK(s^) ^> Build APK(s^)
	echo   6. El APK estara en: android\app\build\outputs\apk\debug\app-debug.apk
	echo.
) else (
	echo.
	echo Android Studio deberia haberse abierto.
	echo.
	echo Proximos pasos:
	echo   1. Espera a que Gradle sincronice
	echo   2. Ve a: Build ^> Build Bundle(s^) / APK(s^) ^> Build APK(s^)
	echo   3. El APK estara en: android\app\build\outputs\apk\debug\app-debug.apk
	echo.
)

pause

