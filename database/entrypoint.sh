#!/bin/bash

# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to start up
echo "Waiting for SQL Server to start..."
sleep 30

# Run the setup script
echo "Running database setup..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Com3onnow! -d master -i /usr/src/app/setup.sql -C

# Keep SQL Server running
wait
