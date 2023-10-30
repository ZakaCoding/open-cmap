@echo off

echo Setting up your application...
timeout /t 2 > nul

REM Install npm dependencies
cd src\www

echo Install node dependencies...
timeout /t 2 > nul

call npm install

echo.
echo All dependencies success installed...
timeout /t 2 > nul

echo.

REM Install Composer dependencies
call composer install

echo.
echo All PHP required files success installed...
timeout /t 2 > nul

REM Copy .env.example to .env (assuming .env.example exists)
echo.
echo Copy env file
copy .env.example .env

REM echo.
REM echo Set the database information in the .env file

REM Set the database information in the .env file
REM echo. >> .env
REM echo #DB_CONFIGURATION >> .env
REM echo DB_CONNECTION=mysql >> .env
REM echo DB_HOST=127.0.0.1 >> .env
REM echo DB_DATABASE=%DB_DATABASE% >> .env
REM echo DB_USERNAME=%DB_USERNAME% >> .env
REM echo DB_PASSWORD=%DB_PASSWORD% >> .env

REM Generate the application key
echo.
echo Genereate key for Application...
call php artisan key:generate

echo.
echo.
echo Application setup complete.
