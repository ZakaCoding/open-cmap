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

echo Application setup complete.
