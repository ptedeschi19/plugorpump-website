@echo off
echo =====================================================
echo PlugOrPump Backend Setup Script
echo =====================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Run the installer
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
echo ✅ Node.js found!
node --version
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit the .env file with your email credentials
    echo    - Set EMAIL_USER to your Gmail address
    echo    - Set EMAIL_PASS to your Gmail App Password
    echo.
)

echo 🧪 Running component tests...
node test-backend.js

echo.
echo =====================================================
echo Setup Complete!
echo =====================================================
echo.
echo Next steps:
echo 1. Edit the .env file with your email credentials
echo 2. Start the server: npm run dev
echo 3. Test the frontend integration
echo.
echo For more details, see README.md
echo.
pause
