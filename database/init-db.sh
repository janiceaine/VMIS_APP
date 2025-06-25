#!/bin/bash

# Wait for SQL Server to be ready
sleep 20

echo "Initializing database..."

# Run the SQL script
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Com3onnow!' -C -i /app/VehicleDb.sql

echo "Database initialization completed."
