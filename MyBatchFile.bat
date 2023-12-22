@echo off

echo Changing directory to C:\sync-barcode
cd C:\sync-barcode

if errorlevel 1 (
    echo Failed to change directory. Exiting.
    pause
    exit /b 1
)

echo Running node index1.js
node index1.js

if errorlevel 1 (
    echo Failed to run node index.js. Exiting.
    pause
    exit /b 1
)

echo Commands executed successfully.
pause