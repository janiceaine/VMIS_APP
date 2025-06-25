using VMIS.Models;
using VMIS.Data;
using Dapper;

namespace VMIS.Services
{
    public interface IVehicleService
    {
        Task<int> AddVehicleAsync(int userId, VehicleRequest request);
        Task AddMaintenanceRecordAsync(MaintenanceRequest request);
        Task<DashboardData> GetDashboardDataAsync(int userId);
        Task<List<VehicleWithDetails>> GetVehiclesAsync(int userId);
        Task<string> TestConnectionAsync();
        Task UpdateVehicleAsync(int id, int userId, VehicleRequest request);
        Task DeleteVehicleAsync(int id, int userId);
    }

    public class VehicleService : IVehicleService
    {
        private readonly VMISContext _context;

        public VehicleService(VMISContext context)
        {
            _context = context;
        }

        public async Task<int> AddVehicleAsync(int userId, VehicleRequest request)
        {
            Console.WriteLine($"DEBUG: AddVehicleAsync called with userId={userId}");
            Console.WriteLine($"DEBUG: Creating connection...");

            using var connection = _context.CreateConnection();
            Console.WriteLine($"DEBUG: Opening connection...");

            await connection.OpenAsync();
            Console.WriteLine($"DEBUG: Connection opened successfully");

            try
            {
                Console.WriteLine($"DEBUG: Inserting vehicle...");

                // Very simple vehicle insert without any complex logic
                var vehicleId = await connection.QuerySingleAsync<int>(
                    @"INSERT INTO Vehicles (UserId, Make, Model, Year, VehicleType, OwnerName, LicensePlate) 
                      OUTPUT INSERTED.Id 
                      VALUES (@UserId, @Make, @Model, @Year, @VehicleType, @OwnerName, @LicensePlate)",
                    new
                    {
                        UserId = userId,
                        Make = request.Make ?? "",
                        Model = request.Model ?? "",
                        Year = request.Year,
                        VehicleType = request.VehicleType ?? "",
                        OwnerName = request.OwnerName ?? "",
                        LicensePlate = request.LicensePlate ?? ""
                    });

                Console.WriteLine($"DEBUG: Vehicle inserted successfully with ID: {vehicleId}");
                return vehicleId;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in AddVehicleAsync: {ex.Message}");
                Console.WriteLine($"ERROR StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task AddMaintenanceRecordAsync(MaintenanceRequest request)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            try
            {
                // Add maintenance record
                await connection.ExecuteAsync(
                    @"INSERT INTO MaintenanceRecords (VehicleId, Task, MaintenanceDate, Mileage) 
                      VALUES (@VehicleId, @MaintenanceTask, @MaintenanceDate, @Mileage)",
                    request);

                // Add insurance record if provided
                if (!string.IsNullOrEmpty(request.PolicyNumber) && request.PolicyExpiration.HasValue)
                {
                    await connection.ExecuteAsync(
                        @"INSERT INTO InsuranceRecords (VehicleId, Provider, PolicyNumber, ExpirationDate) 
                          VALUES (@VehicleId, @Provider, @PolicyNumber, @ExpirationDate)",
                        new
                        {
                            VehicleId = request.VehicleId,
                            Provider = "Unknown",
                            PolicyNumber = request.PolicyNumber,
                            ExpirationDate = request.PolicyExpiration
                        });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in AddMaintenanceRecordAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<DashboardData> GetDashboardDataAsync(int userId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            var vehicles = await connection.QueryAsync<VehicleWithDetails>(
                @"SELECT 
                    v.Id, v.Make, v.Model, v.Year, v.VehicleType,
                    v.OwnerName, v.LicensePlate,
                    m.Task as LatestMaintenance,
                    m.MaintenanceDate as LastMaintenanceDate,
                    i.PolicyNumber,
                    i.Provider as InsuranceProvider,
                    i.ExpirationDate as PolicyExpiration
                  FROM Vehicles v
                  LEFT JOIN (
                      SELECT VehicleId, Task, MaintenanceDate,
                             ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY MaintenanceDate DESC) as rn
                      FROM MaintenanceRecords
                  ) m ON v.Id = m.VehicleId AND m.rn = 1
                  LEFT JOIN InsuranceRecords i ON v.Id = i.VehicleId
                  WHERE v.UserId = @UserId
                  ORDER BY v.CreatedAt DESC",
                new { UserId = userId });

            var vehicleList = vehicles.ToList();

            // Calculate upcoming maintenance (records in next 30 days)
            var upcomingMaintenance = await connection.QuerySingleAsync<int>(
                @"SELECT COUNT(*) 
                  FROM MaintenanceRecords mr
                  JOIN Vehicles v ON mr.VehicleId = v.Id
                  WHERE v.UserId = @UserId 
                  AND mr.MaintenanceDate BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())",
                new { UserId = userId });

            // Calculate expired insurance
            var expiredInsurance = await connection.QuerySingleAsync<int>(
                @"SELECT COUNT(*) 
                  FROM InsuranceRecords ir
                  JOIN Vehicles v ON ir.VehicleId = v.Id
                  WHERE v.UserId = @UserId 
                  AND ir.ExpirationDate < GETDATE()",
                new { UserId = userId });

            return new DashboardData
            {
                Vehicles = vehicleList,
                UpcomingMaintenance = upcomingMaintenance,
                ExpiredInsurance = expiredInsurance
            };
        }

        public async Task<List<VehicleWithDetails>> GetVehiclesAsync(int userId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            var vehicles = await connection.QueryAsync<VehicleWithDetails>(
                @"SELECT 
                    v.Id, v.Make, v.Model, v.Year, v.VehicleType,
                    v.OwnerName, v.LicensePlate,
                    m.Task as LatestMaintenance,
                    m.MaintenanceDate as LastMaintenanceDate,
                    i.PolicyNumber,
                    i.Provider as InsuranceProvider,
                    i.ExpirationDate as PolicyExpiration
                  FROM Vehicles v
                  LEFT JOIN (
                      SELECT VehicleId, Task, MaintenanceDate,
                             ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY MaintenanceDate DESC) as rn
                      FROM MaintenanceRecords
                  ) m ON v.Id = m.VehicleId AND m.rn = 1
                  LEFT JOIN InsuranceRecords i ON v.Id = i.VehicleId
                  WHERE v.UserId = @UserId
                  ORDER BY v.CreatedAt DESC",
                new { UserId = userId });

            return vehicles.ToList();
        }

        public async Task<string> TestConnectionAsync()
        {
            try
            {
                using var connection = _context.CreateConnection();
                await connection.OpenAsync();
                var result = await connection.QueryFirstOrDefaultAsync<string>("SELECT 'Connection successful' as message");
                return result ?? "No result";
            }
            catch (Exception ex)
            {
                return $"Connection failed: {ex.Message}";
            }
        }

        public async Task UpdateVehicleAsync(int id, int userId, VehicleRequest request)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            try
            {
                await connection.ExecuteAsync(
                    @"UPDATE Vehicles 
                      SET Make = @Make, Model = @Model, Year = @Year, VehicleType = @VehicleType, 
                          OwnerName = @OwnerName, LicensePlate = @LicensePlate
                      WHERE Id = @Id AND UserId = @UserId",
                    new
                    {
                        Id = id,
                        UserId = userId,
                        Make = request.Make ?? "",
                        Model = request.Model ?? "",
                        Year = request.Year,
                        VehicleType = request.VehicleType ?? "",
                        OwnerName = request.OwnerName ?? "",
                        LicensePlate = request.LicensePlate ?? ""
                    });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in UpdateVehicleAsync: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteVehicleAsync(int id, int userId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            try
            {
                // Delete associated maintenance records
                await connection.ExecuteAsync(
                    @"DELETE FROM MaintenanceRecords WHERE VehicleId = @Id;
                      DELETE FROM InsuranceRecords WHERE VehicleId = @Id;
                      DELETE FROM Vehicles WHERE Id = @Id AND UserId = @UserId",
                    new { Id = id, UserId = userId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in DeleteVehicleAsync: {ex.Message}");
                throw;
            }
        }
    }

    public class DashboardData
    {
        public List<VehicleWithDetails> Vehicles { get; set; } = new();
        public int UpcomingMaintenance { get; set; }
        public int ExpiredInsurance { get; set; }
    }

    public class VehicleWithDetails
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public string? OwnerName { get; set; }
        public string? LicensePlate { get; set; }
        public string? LatestMaintenance { get; set; }
        public DateTime? LastMaintenanceDate { get; set; }
        public DateTime? NextMaintenanceDate { get; set; }
        public string? PolicyNumber { get; set; }
        public string? InsuranceProvider { get; set; }
        public DateTime? PolicyExpiration { get; set; }

        // Computed properties for frontend compatibility
        public string? Type => VehicleType;
        public DateTime? ExpirationDate => PolicyExpiration;
    }
}