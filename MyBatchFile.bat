@echo off

echo Changing directory to H:\Harsha\sync-barcode
cd H:\Harsha\sync-barcode

if errorlevel 1 (
    echo Failed to change directory. Exiting.
    pause
    exit /b 1
)

echo Running node index.js
node index.js

if errorlevel 1 (
    echo Failed to run node index.js. Exiting.
    pause
    exit /b 1
)

echo Commands executed successfully.
pause