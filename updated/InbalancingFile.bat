@echo off

echo Changing directory to D:\PROLOGICS\sync-barcode
cd  /d D:\PROLOGICS\sync-barcode

if errorlevel 1 (
    echo Failed to change directory. Exiting.
    pause
    exit /b 1
)

echo Running node inbalancing-file.js
node inbalancing-file.js

if errorlevel 1 (
    echo Failed to run node inbalancing-file.js. Exiting.
    pause
    exit /b 1
)

echo Commands executed successfully.
pause