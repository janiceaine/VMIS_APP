-- Wait for SQL Server to be ready
WAITFOR DELAY '00:00:05'
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'VehicleDb')
BEGIN
    CREATE DATABASE VehicleDb;
END
GO

USE VehicleDb;
GO

-- Drop tables if they exist (to handle the error you encountered)
IF OBJECT_ID('dbo.InsuranceRecords', 'U') IS NOT NULL
    DROP TABLE dbo.InsuranceRecords;
IF OBJECT_ID('dbo.MaintenanceRecords', 'U') IS NOT NULL
    DROP TABLE dbo.MaintenanceRecords;
IF OBJECT_ID('dbo.Vehicles', 'U') IS NOT NULL
    DROP TABLE dbo.Vehicles;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;
GO

-- Create Users table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create Vehicles table
CREATE TABLE Vehicles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Make NVARCHAR(50) NOT NULL,
    Model NVARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    VehicleType NVARCHAR(20) NOT NULL CHECK (VehicleType IN ('car', 'truck', 'motorcycle')),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create MaintenanceRecords table
CREATE TABLE MaintenanceRecords (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VehicleId INT NOT NULL,
    Task NVARCHAR(100) NOT NULL,
    MaintenanceDate DATE NOT NULL,
    Mileage INT,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE
);

-- Create InsuranceRecords table
CREATE TABLE InsuranceRecords (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VehicleId INT NOT NULL,
    PolicyNumber NVARCHAR(50) NOT NULL,
    ExpirationDate DATE NOT NULL,
    Provider NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE
);
GO

-- Insert sample data
INSERT INTO Users (Username, Email, PasswordHash) VALUES 
('admin', 'admin@vmis.com', 'hashed_password_here'),
('testuser', 'test@vmis.com', 'hashed_password_here');

PRINT 'Database and tables created successfully!';
GO
