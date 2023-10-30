@echo off

echo Setting up database for migration...

REM If runn on installer use this path
cd resources\app\src\www

echo Run migration...

call php artisan migrate --seed

if errorlevel 1 (
    echo Migration failed
    exit /b 1
)

REM Generate application key
call php artisan key:generate

echo.
echo Migration done
