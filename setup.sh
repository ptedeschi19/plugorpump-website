#!/bin/bash

echo "====================================================="
echo "PlugOrPump Backend Setup Script"
echo "====================================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo
    echo "Please install Node.js first:"
    echo "1. Go to https://nodejs.org/"
    echo "2. Download the LTS version"
    echo "3. Run the installer"
    echo "4. Restart this script"
    echo
    exit 1
fi

# Check Node.js version
echo "✅ Node.js found!"
node --version
npm --version
echo

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo
    echo "⚠️  IMPORTANT: Please edit the .env file with your email credentials"
    echo "   - Set EMAIL_USER to your Gmail address"
    echo "   - Set EMAIL_PASS to your Gmail App Password"
    echo
fi

echo "🧪 Running component tests..."
node test-backend.js

echo
echo "====================================================="
echo "Setup Complete!"
echo "====================================================="
echo
echo "Next steps:"
echo "1. Edit the .env file with your email credentials"
echo "2. Start the server: npm run dev"
echo "3. Test the frontend integration"
echo
echo "For more details, see README.md"
echo
