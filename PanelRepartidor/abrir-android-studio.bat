@echo off
REM Script alternativo para abrir Android Studio
REM Uso: abrir-android-studio.bat

echo ==========================================
echo Abriendo Android Studio - PanelRepartidor
echo ==========================================
echo.

REM Verificar que existe la carpeta android
if not exist "android" (
	echo Error: No se encontro la carpeta android
	echo Ejecuta primero: build-apk.bat
	pause
	exit /b 1
)

REM Intentar con Capacitor CLI
echo Intentando abrir con Capacitor CLI...
call npx cap open android
if errorlevel 1 (
	echo.
	echo Capacitor CLI no pudo abrir Android Studio.
	echo.
	
	REM Intentar con ruta comun de Android Studio
	echo Intentando con ruta comun de Android Studio...
	
	REM Windows - Ruta comun
	if exist "%LOCALAPPDATA%\Programs\Android\Android Studio\bin\studio64.exe" (
		echo Abriendo Android Studio desde ruta comun...
		start "" "%LOCALAPPDATA%\Programs\Android\Android Studio\bin\studio64.exe" "%CD%\android"
		goto :success
	)
	
	REM Windows - Ruta alternativa
	if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
		echo Abriendo Android Studio desde ruta alternativa...
		start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%CD%\android"
		goto :success
	)
	
	REM Si no se encuentra, mostrar instrucciones
	echo.
	echo No se encontro Android Studio automaticamente.
	echo.
	echo Abre Android Studio manualmente:
	echo   1. Abre Android Studio
	echo   2. File ^> Open
	echo   3. Selecciona esta carpeta: %CD%\android
	echo   4. Click en OK
	echo.
	goto :end
)

:success
echo.
echo Android Studio deberia haberse abierto.
echo.
echo Si no se abrio, abre manualmente:
echo   1. Abre Android Studio
echo   2. File ^> Open
echo   3. Selecciona: %CD%\android
echo.

:end
pause

