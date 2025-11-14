@echo off
echo Starting News Project...

echo.
echo Installing server dependencies...
cd server
call npm install

echo.
echo Installing client dependencies...
cd ..\client
call npm install

echo.
echo Starting MongoDB (make sure MongoDB is installed and running)
echo Starting server...
cd ..\server
start "News Server" cmd /k "npm run dev"

echo.
echo Starting client...
cd ..\client
start "News Client" cmd /k "npm run dev"

echo.
echo Setup complete!
echo.
echo Access the application at:
echo - Public News: http://localhost:5173
echo - Admin Login: http://localhost:5173/admin/login
echo.
echo Don't forget to:
echo 1. Create a .env file in the server directory
echo 2. Set up MongoDB
echo 3. Create an admin user via API
echo.
pause
