CREATE DATABASE VehicleDb;
GO

USE VehicleDb;
GO

-- Create Users table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
)

-- Create Vehicles table
CREATE TABLE Vehicles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Make NVARCHAR(50) NOT NULL,
    Model NVARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    VehicleType NVARCHAR(20) NOT NULL CHECK (VehicleType IN ('car', 'truck', 'motorcycle')),
    OwnerName NVARCHAR(100),
    LicensePlate NVARCHAR(20),
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

-- Create MaintenanceSchedules table for recurring maintenance
CREATE TABLE MaintenanceSchedules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VehicleId INT NOT NULL,
    MaintenanceType NVARCHAR(100) NOT NULL,
    IntervalMiles INT NULL,
    IntervalMonths INT NULL,
    LastPerformed DATETIME2 NULL,
    NextDue DATETIME2 NULL,
    LastMileage INT NULL,
    Description NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE
);

-- Create MaintenanceReminders table
CREATE TABLE MaintenanceReminders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ScheduleId INT NOT NULL,
    VehicleId INT NOT NULL,
    UserId INT NOT NULL,
    MaintenanceType NVARCHAR(100) NOT NULL,
    DueDate DATETIME2 NOT NULL,
    DueMileage INT NULL,
    Priority NVARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ScheduleId) REFERENCES MaintenanceSchedules(Id) ON DELETE CASCADE,
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create InspectionTemplates table
CREATE TABLE InspectionTemplates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    IsDefault BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create InspectionCategories table
CREATE TABLE InspectionCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TemplateId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    SortOrder INT DEFAULT 0,
    FOREIGN KEY (TemplateId) REFERENCES InspectionTemplates(Id) ON DELETE CASCADE
);

-- Create InspectionItems table
CREATE TABLE InspectionItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    InputType NVARCHAR(20) DEFAULT 'checkbox' CHECK (InputType IN ('checkbox', 'rating', 'text')),
    IsRequired BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    FOREIGN KEY (CategoryId) REFERENCES InspectionCategories(Id) ON DELETE CASCADE
);

-- Create InspectionRecords table
CREATE TABLE InspectionRecords (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VehicleId INT NOT NULL,
    TemplateId INT NOT NULL,
    UserId INT NOT NULL,
    InspectionDate DATETIME2 NOT NULL,
    Mileage INT NULL,
    OverallStatus NVARCHAR(20) DEFAULT 'Pass' CHECK (OverallStatus IN ('Pass', 'Fail', 'Needs Attention')),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE,
    FOREIGN KEY (TemplateId) REFERENCES InspectionTemplates(Id),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Create InspectionResults table
CREATE TABLE InspectionResults (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InspectionRecordId INT NOT NULL,
    ItemId INT NOT NULL,
    Value NVARCHAR(MAX),
    Status NVARCHAR(20) DEFAULT 'Pass' CHECK (Status IN ('Pass', 'Fail', 'N/A')),
    Comments NVARCHAR(MAX),
    PhotoPath NVARCHAR(255) NULL,
    FOREIGN KEY (InspectionRecordId) REFERENCES InspectionRecords(Id) ON DELETE CASCADE,
    FOREIGN KEY (ItemId) REFERENCES InspectionItems(Id)
);

-- Create RepairRecords table
CREATE TABLE RepairRecords (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VehicleId INT NOT NULL,
    RepairDate DATETIME2 NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Cost DECIMAL(10,2) NOT NULL,
    Mileage INT NULL,
    MechanicName NVARCHAR(100) NULL,
    GarageName NVARCHAR(100) NULL,
    GarageAddress NVARCHAR(255) NULL,
    GaragePhone NVARCHAR(20) NULL,
    ReceiptPath NVARCHAR(255) NULL,
    Category NVARCHAR(50) DEFAULT 'General',
    Priority NVARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('Low', 'Medium', 'High', 'Emergency')),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE
);

-- Create MileageRecords table
CREATE TABLE MileageRecords (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VehicleId INT NOT NULL,
    RecordDate DATETIME2 NOT NULL,
    Mileage INT NOT NULL,
    RecordType NVARCHAR(20) DEFAULT 'Manual' CHECK (RecordType IN ('Manual', 'GPS', 'Service')),
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id) ON DELETE CASCADE
);

-- Create ServiceProviders table
CREATE TABLE ServiceProviders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NULL,
    Website NVARCHAR(255) NULL,
    ServiceTypes NVARCHAR(MAX), -- JSON array of services
    Rating DECIMAL(3,2) NULL CHECK (Rating >= 0 AND Rating <= 5),
    ReviewCount INT DEFAULT 0,
    IsPreferred BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Insert default inspection templates
INSERT INTO InspectionTemplates (Name, Description, IsDefault) VALUES
('Pre-Trip Inspection', 'Standard pre-trip vehicle inspection checklist', 1),
('Post-Trip Inspection', 'Post-trip vehicle inspection checklist', 1),
('Annual Inspection', 'Comprehensive annual vehicle inspection', 1);

-- Insert default inspection categories for Pre-Trip template
DECLARE @PreTripId INT = (SELECT Id FROM InspectionTemplates WHERE Name = 'Pre-Trip Inspection');

INSERT INTO InspectionCategories (TemplateId, Name, SortOrder) VALUES
(@PreTripId, 'Engine', 1),
(@PreTripId, 'Tires', 2),
(@PreTripId, 'Lights', 3),
(@PreTripId, 'Fluids', 4),
(@PreTripId, 'Brakes', 5),
(@PreTripId, 'Safety Equipment', 6);

-- Insert default inspection items for Engine category
DECLARE @EngineId INT = (SELECT Id FROM InspectionCategories WHERE TemplateId = @PreTripId AND Name = 'Engine');

INSERT INTO InspectionItems (CategoryId, Name, Description, InputType, SortOrder) VALUES
(@EngineId, 'Engine Oil Level', 'Check engine oil level and condition', 'checkbox', 1),
(@EngineId, 'Coolant Level', 'Check coolant level and condition', 'checkbox', 2),
(@EngineId, 'Belt Condition', 'Inspect engine belts for wear and proper tension', 'rating', 3),
(@EngineId, 'Battery Terminals', 'Check battery terminals for corrosion', 'checkbox', 4),
(@EngineId, 'Air Filter', 'Inspect air filter condition', 'rating', 5);

GO
