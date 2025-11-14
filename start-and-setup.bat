@echo off
echo Starting News Project Server...

cd server
start "News Server" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo Creating admin user...
cd ..
node create-admin.js

echo.
echo Setup complete!
echo.
echo You can now:
echo 1. Access the admin panel at: http://localhost:5173/admin/login
echo 2. View public news at: http://localhost:5173
echo.
echo Admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
pause
