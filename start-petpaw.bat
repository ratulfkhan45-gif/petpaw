@echo off
REM Starts MySQL (XAMPP), the Laravel API and the React dev server in separate windows.
set PHP=C:\xampp\php\php.exe
set ROOT=%~dp0

start "PetPaw MySQL" /MIN "C:\xampp\mysql\bin\mysqld.exe" --defaults-file=C:\xampp\mysql\bin\my.ini --standalone
timeout /t 5 /nobreak >nul
start "PetPaw API (Laravel :8000)" cmd /k "cd /d %ROOT%petpaw-backend && %PHP% artisan serve --host=127.0.0.1 --port=8000"
start "PetPaw Web (Vite :5173)" cmd /k "cd /d %ROOT%petpaw && npm run dev"

echo.
echo  Web:  http://localhost:5173
echo  API:  http://127.0.0.1:8000/api
echo  Close the opened windows to stop the servers.
