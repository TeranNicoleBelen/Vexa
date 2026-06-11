@echo off
chcp 65001 > nul
echo.
echo  ==========================================
echo      VEXA - Setup Automatico (Windows)
echo  ==========================================
echo.
echo  Asegurate de que XAMPP este corriendo
echo  y la base de datos vexa_db ya fue importada.
echo.
pause

echo.
echo [1/3] Instalando dependencias del Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar backend. Verifica que Node.js este instalado.
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Instalando dependencias del Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar frontend.
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Reseteando passwords de usuarios de prueba...
node database/reset_passwords.js

echo.
echo  ==========================================
echo   Instalacion completada!
echo  ==========================================
echo.
echo  Ahora abre 2 terminales separadas:
echo.
echo  TERMINAL 1 - Backend:
echo    cd backend
echo    npm run dev
echo.
echo  TERMINAL 2 - Frontend:
echo    cd frontend
echo    npm start
echo.
echo  Credenciales:
echo    Admin:    admin@vexa.com    / Admin@123
echo    Vendedor: vendedor@vexa.com / Admin@123
echo    Cliente:  cliente@vexa.com  / Admin@123
echo.
echo  Lee GUIA_COMPLETA.md para mas informacion.
echo.
pause
