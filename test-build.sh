#!/bin/bash

echo "🧪 Testing Render build locally..."

# Clean previous builds
if [ -d "publish" ]; then
    rm -rf publish
    echo "🧹 Cleaned previous build"
fi

# Run the build script
echo "🔨 Running build script..."
./render-build.sh

# Test if the build was successful
if [ -f "publish/VehicleBackend.dll" ]; then
    echo "✅ Build successful! VehicleBackend.dll found in publish directory"
    echo "📊 Published files:"
    ls -la publish/
    echo ""
    echo "🚀 You can test locally with:"
    echo "cd publish && dotnet VehicleBackend.dll"
else
    echo "❌ Build failed! VehicleBackend.dll not found"
    exit 1
fi
