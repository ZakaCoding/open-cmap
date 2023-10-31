@echo off

echo Setting up your application...
timeout /t 2 > nul

REM If runn on installer use this path
cd resources\app\src\www

echo Install node dependencies...
timeout /t 2 > nul

call npm install

echo.
echo All dependencies success installed...
timeout /t 2 > nul

echo.
echo Run composer install
call composer install

echo.
echo All PHP required files success installed...
timeout /t 2 > nul

REM Build frontend
echo Build for production
call npm run build

echo Build done...
timeout /t 2 > nul

REM Copy .env.example to .env (assuming .env.example exists)
echo Copy env file
copy .env.example .env

echo Application setup complete.
