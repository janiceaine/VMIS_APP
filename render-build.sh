#!/bin/bash
set -e

echo "🚀 Starting Render build for VMIS Backend..."

# Check if we're in the right directory
if [ ! -d "Backend/VehicleBackend" ]; then
    echo "❌ Backend directory not found. Please run from project root."
    exit 1
fi

# Navigate to the backend directory
cd Backend/VehicleBackend

# Restore dependencies
echo "📦 Restoring .NET dependencies..."
dotnet restore

# Build the application
echo "🔨 Building application..."
dotnet build --configuration Release --no-restore

# Publish the application
echo "📦 Publishing application..."
dotnet publish --configuration Release --no-build --output ../../publish

# Go back to root and verify publish directory
cd ../..
echo "📁 Published files:"
ls -la publish/

echo "✅ Build completed successfully!"
echo "🎯 Ready to start with: dotnet publish/VehicleBackend.dll"
