@echo off
title Syria Agri Export Tool
echo.
echo  =============================================
echo    Syria Agri Export Tool wird gestartet...
echo  =============================================
echo.
cd /d "%~dp0"
echo  Datenbank-Ort:
node -e "require('dotenv').config(); const p=process.env.DB_PATH||require('path').join(__dirname,'datenbank.json'); console.log('  '+p);"
echo.
start "" http://localhost:3000
node server.js
pause
