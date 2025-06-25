using VMIS.Models;
using VMIS.Data;
using VMIS.Controllers;
using Dapper;
using System.Data;

namespace VMIS.Services
{
    public interface IMaintenanceService
    {
        Task<int> CreateScheduleAsync(int userId, MaintenanceScheduleRequest request);
        Task<List<MaintenanceSchedule>> GetSchedulesAsync(int userId, int vehicleId);
        Task<List<MaintenanceReminder>> GetRemindersAsync(int userId);
        Task MarkReminderReadAsync(int userId, int reminderId);
        Task CompleteMaintenanceAsync(int userId, MaintenanceCompletionRequest request);
        Task<List<MaintenanceReminder>> GetUpcomingMaintenanceAsync(int userId);
        Task GenerateRemindersAsync();
    }

    public class MaintenanceService : IMaintenanceService
    {
        private readonly VMISContext _context;

        public MaintenanceService(VMISContext context)
        {
            _context = context;
        }

        public async Task<int> CreateScheduleAsync(int userId, MaintenanceScheduleRequest request)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // Verify vehicle belongs to user
            var vehicleExists = await connection.QuerySingleOrDefaultAsync<int>(
                "SELECT COUNT(1) FROM Vehicles WHERE Id = @VehicleId AND UserId = @UserId",
                new { request.VehicleId, UserId = userId });

            if (vehicleExists == 0)
                throw new UnauthorizedAccessException("Vehicle not found or not owned by user");

            var scheduleId = await connection.QuerySingleAsync<int>(
                @"INSERT INTO MaintenanceSchedules (VehicleId, MaintenanceType, IntervalMiles, IntervalMonths, Description)
                  OUTPUT INSERTED.Id
                  VALUES (@VehicleId, @MaintenanceType, @IntervalMiles, @IntervalMonths, @Description)",
                request);

            // Calculate next due date and create reminder
            await UpdateScheduleNextDueAsync(connection, scheduleId);

            return scheduleId;
        }

        public async Task<List<MaintenanceSchedule>> GetSchedulesAsync(int userId, int vehicleId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // Verify vehicle belongs to user
            var vehicleExists = await connection.QuerySingleOrDefaultAsync<int>(
                "SELECT COUNT(1) FROM Vehicles WHERE Id = @VehicleId AND UserId = @UserId",
                new { VehicleId = vehicleId, UserId = userId });

            if (vehicleExists == 0)
                throw new UnauthorizedAccessException("Vehicle not found or not owned by user");

            var schedules = await connection.QueryAsync<MaintenanceSchedule>(
                @"SELECT * FROM MaintenanceSchedules 
                  WHERE VehicleId = @VehicleId AND IsActive = 1
                  ORDER BY MaintenanceType",
                new { VehicleId = vehicleId });

            return schedules.ToList();
        }

        public async Task<List<MaintenanceReminder>> GetRemindersAsync(int userId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            var reminders = await connection.QueryAsync<MaintenanceReminder>(
                @"SELECT r.*, v.Make, v.Model, v.Year, v.LicensePlate
                  FROM MaintenanceReminders r
                  INNER JOIN Vehicles v ON r.VehicleId = v.Id
                  WHERE r.UserId = @UserId AND r.DueDate <= DATEADD(day, 30, GETDATE())
                  ORDER BY r.DueDate, r.Priority DESC",
                new { UserId = userId });

            return reminders.ToList();
        }

        public async Task MarkReminderReadAsync(int userId, int reminderId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            await connection.ExecuteAsync(
                @"UPDATE MaintenanceReminders 
                  SET IsRead = 1 
                  WHERE Id = @ReminderId AND UserId = @UserId",
                new { ReminderId = reminderId, UserId = userId });
        }

        public async Task CompleteMaintenanceAsync(int userId, MaintenanceCompletionRequest request)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // Verify vehicle belongs to user
            var vehicleExists = await connection.QuerySingleOrDefaultAsync<int>(
                "SELECT COUNT(1) FROM Vehicles WHERE Id = @VehicleId AND UserId = @UserId",
                new { request.VehicleId, UserId = userId });

            if (vehicleExists == 0)
                throw new UnauthorizedAccessException("Vehicle not found or not owned by user");

            // Update the maintenance schedule
            await connection.ExecuteAsync(
                @"UPDATE MaintenanceSchedules 
                  SET LastPerformed = @CompletedDate, LastMileage = @Mileage
                  WHERE Id = @ScheduleId",
                new
                {
                    request.CompletedDate,
                    request.Mileage,
                    request.ScheduleId
                });

            // Add maintenance record
            await connection.ExecuteAsync(
                @"INSERT INTO MaintenanceRecords (VehicleId, Task, MaintenanceDate, Mileage, Notes)
                  VALUES (@VehicleId, @Task, @MaintenanceDate, @Mileage, @Notes)",
                new
                {
                    request.VehicleId,
                    Task = await connection.QuerySingleAsync<string>(
                        "SELECT MaintenanceType FROM MaintenanceSchedules WHERE Id = @ScheduleId",
                        new { request.ScheduleId }),
                    MaintenanceDate = request.CompletedDate.Date,
                    request.Mileage,
                    request.Notes
                });

            // Update mileage record if provided
            if (request.Mileage.HasValue)
            {
                await connection.ExecuteAsync(
                    @"INSERT INTO MileageRecords (VehicleId, RecordDate, Mileage, RecordType, Notes)
                      VALUES (@VehicleId, @RecordDate, @Mileage, 'Service', @Notes)",
                    new
                    {
                        request.VehicleId,
                        RecordDate = request.CompletedDate,
                        request.Mileage,
                        Notes = $"Maintenance: {request.Notes}"
                    });
            }

            // Update next due date
            await UpdateScheduleNextDueAsync(connection, request.ScheduleId);

            // Mark related reminders as read
            await connection.ExecuteAsync(
                @"UPDATE MaintenanceReminders 
                  SET IsRead = 1 
                  WHERE ScheduleId = @ScheduleId AND UserId = @UserId",
                new { request.ScheduleId, UserId = userId });
        }

        public async Task<List<MaintenanceReminder>> GetUpcomingMaintenanceAsync(int userId)
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            var upcoming = await connection.QueryAsync<MaintenanceReminder>(
                @"SELECT r.*, v.Make, v.Model, v.Year, v.LicensePlate
                  FROM MaintenanceReminders r
                  INNER JOIN Vehicles v ON r.VehicleId = v.Id
                  WHERE r.UserId = @UserId 
                    AND r.DueDate BETWEEN GETDATE() AND DATEADD(day, 7, GETDATE())
                    AND r.IsRead = 0
                  ORDER BY r.DueDate",
                new { UserId = userId });

            return upcoming.ToList();
        }

        public async Task GenerateRemindersAsync()
        {
            using var connection = _context.CreateConnection();
            await connection.OpenAsync();

            // Get all active schedules that need reminders
            var schedules = await connection.QueryAsync(
                @"SELECT s.*, v.UserId
                  FROM MaintenanceSchedules s
                  INNER JOIN Vehicles v ON s.VehicleId = v.Id
                  WHERE s.IsActive = 1 
                    AND s.NextDue IS NOT NULL
                    AND s.NextDue <= DATEADD(day, 30, GETDATE())
                    AND NOT EXISTS (
                        SELECT 1 FROM MaintenanceReminders r 
                        WHERE r.ScheduleId = s.Id 
                          AND r.DueDate = s.NextDue 
                          AND r.IsRead = 0
                    )");

            foreach (var schedule in schedules)
            {
                // Calculate priority based on how overdue or upcoming
                var daysUntilDue = ((DateTime)schedule.NextDue - DateTime.UtcNow).Days;
                var priority = daysUntilDue <= 0 ? "Critical" :
                              daysUntilDue <= 3 ? "High" :
                              daysUntilDue <= 7 ? "Medium" : "Low";

                await connection.ExecuteAsync(
                    @"INSERT INTO MaintenanceReminders (ScheduleId, VehicleId, UserId, MaintenanceType, DueDate, Priority)
                      VALUES (@ScheduleId, @VehicleId, @UserId, @MaintenanceType, @NextDue, @Priority)",
                    new
                    {
                        ScheduleId = schedule.Id,
                        VehicleId = schedule.VehicleId,
                        UserId = schedule.UserId,
                        MaintenanceType = schedule.MaintenanceType,
                        NextDue = schedule.NextDue,
                        Priority = priority
                    });
            }
        }

        private async Task UpdateScheduleNextDueAsync(IDbConnection connection, int scheduleId)
        {
            var schedule = await connection.QuerySingleAsync(
                "SELECT * FROM MaintenanceSchedules WHERE Id = @ScheduleId",
                new { ScheduleId = scheduleId });

            DateTime? nextDue = null;

            // Calculate next due date based on time interval
            if (schedule.IntervalMonths.HasValue && schedule.LastPerformed.HasValue)
            {
                nextDue = ((DateTime)schedule.LastPerformed).AddMonths((int)schedule.IntervalMonths);
            }
            else if (schedule.IntervalMonths.HasValue)
            {
                nextDue = DateTime.UtcNow.AddMonths((int)schedule.IntervalMonths);
            }

            // If we also have mileage interval, we might need more complex logic
            // For now, we'll use time-based scheduling

            if (nextDue.HasValue)
            {
                await connection.ExecuteAsync(
                    "UPDATE MaintenanceSchedules SET NextDue = @NextDue WHERE Id = @ScheduleId",
                    new { NextDue = nextDue, ScheduleId = scheduleId });
            }
        }
    }
}
