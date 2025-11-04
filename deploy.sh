#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Check for npm and install if not exists
echo "🔍 Checking for npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm found: $(npm --version)"
else
    echo "⚠️  npm not found, installing..."
    
    # Check for node version manager (nvm) or install Node.js directly
    if command -v nvm &> /dev/null; then
        echo "📦 Installing Node.js via nvm..."
        nvm install node
        nvm use node
    elif command -v apt-get &> /dev/null; then
        echo "📦 Installing Node.js via apt..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        echo "📦 Installing Node.js via yum..."
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "❌ Error: Could not detect package manager to install Node.js/npm"
        echo "Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
    
    # Verify npm installation
    if command -v npm &> /dev/null; then
        echo "✅ npm installed: $(npm --version)"
    else
        echo "❌ Error: npm installation failed"
        exit 1
    fi
fi

# Check for at least one .env file
echo "🔍 Checking for environment files..."
ENV_FILES=$(find . -maxdepth 1 -name ".env*" -type f 2>/dev/null | wc -l)

if [ "$ENV_FILES" -eq 0 ]; then
    echo "❌ Error: No .env* files found in current directory"
    echo "Please create at least one environment file (.env, .env.production, etc.)"
    exit 1
else
    echo "✅ Found $ENV_FILES environment file(s):"
    find . -maxdepth 1 -name ".env*" -type f 2>/dev/null | while read -r file; do
        echo "   - $(basename "$file")"
    done
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully"

echo "🔍 Checking for PM2..."
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 found: $(pm2 --version)"
else
    echo "⚠️  PM2 not found, installing..."
    sudo npm install -g pm2
    echo "✅ PM2 installed: $(pm2 --version)"
fi

echo "🔄 Restarting application with PM2..."
pm2 stop ecosystem.config.js
pm2 delete ecosystem.config.js
pm2 start ecosystem.config.js

echo "📊 PM2 Status:"
pm2 status

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be running on your server"
