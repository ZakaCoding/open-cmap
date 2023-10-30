@echo off

echo Setting up database for migration...

cd src\www

echo Run migration...

call php artisan migrate --seed

if errorlevel 1 (
    echo Migration failed. Handle the error here.
    exit /b 1
)

echo.
echo Migration done
