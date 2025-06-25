#!/bin/bash

echo "🔄 Converting VMIS Backend from SQL Server to PostgreSQL for Render deployment..."

# Navigate to backend directory
cd Backend/VehicleBackend

# Backup original csproj
cp VehicleBackend.csproj VehicleBackend.csproj.backup

# Update package references
echo "📦 Updating package references..."
dotnet remove package Microsoft.Data.SqlClient
dotnet remove package Pomelo.EntityFrameworkCore.MySql
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.0

echo "✅ Package references updated!"
echo ""
echo "Manual steps needed:"
echo "1. Update VMISContext.cs to use PostgreSQL provider"
echo "2. Update connection strings in appsettings.json"
echo "3. Run database migrations for PostgreSQL"
echo ""
echo "Example connection string for Render PostgreSQL:"
echo "Host=your-postgres-host;Database=your-db;Username=your-user;Password=your-password;SSL Mode=Require;Trust Server Certificate=true"
echo ""
echo "🚀 Ready for PostgreSQL deployment!"
