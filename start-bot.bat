@echo off
echo ========================================
echo Starting WLAD HLAL Discord Bot
echo ========================================
echo.
echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)
echo.
echo Starting bot on port 3000...
echo.
echo IMPORTANT: After bot starts, run ngrok:
echo   ngrok http 3000
echo.
echo Then copy the ngrok URL and update store.html
echo.
node index.js
pause
