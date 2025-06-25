#!/bin/bash
set -e

echo "🚀 Starting Render build for VMIS Backend..."

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
dotnet publish --configuration Release --no-build --output ./publish

echo "✅ Build completed successfully!"
