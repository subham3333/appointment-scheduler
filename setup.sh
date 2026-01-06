#!/bin/bash

# Appointment Scheduler Setup Script
# This script helps you quickly set up the appointment scheduler backend

set -e

echo "🚀 Appointment Scheduler Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not detected. Make sure it's installed and running."
else
    echo "✓ PostgreSQL detected"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
    echo "⚠️  Please edit .env file and add your credentials before starting the server"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Create PostgreSQL database: createdb appointment_scheduler"
echo "3. Start the server: npm run dev"
echo ""
echo "For more information, see README.md"
