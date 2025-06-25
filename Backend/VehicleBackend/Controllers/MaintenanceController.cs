using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using VMIS.Models;
using VMIS.Services;
using System.Security.Claims;

namespace VMIS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Temporarily disabled for testing
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;

        public MaintenanceController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> CreateSchedule([FromBody] MaintenanceScheduleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var scheduleId = await _maintenanceService.CreateScheduleAsync(userId, request);
                return Ok(new { message = "Maintenance schedule created successfully", scheduleId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create maintenance schedule", details = ex.Message });
            }
        }

        [HttpGet("schedules/{vehicleId}")]
        public async Task<IActionResult> GetSchedules(int vehicleId)
        {
            try
            {
                var userId = GetUserId();
                var schedules = await _maintenanceService.GetSchedulesAsync(userId, vehicleId);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve schedules", details = ex.Message });
            }
        }

        [HttpGet("reminders")]
        public async Task<IActionResult> GetReminders()
        {
            try
            {
                var userId = GetUserId();
                var reminders = await _maintenanceService.GetRemindersAsync(userId);
                return Ok(reminders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve reminders", details = ex.Message });
            }
        }

        [HttpPost("reminders/{reminderId}/mark-read")]
        public async Task<IActionResult> MarkReminderRead(int reminderId)
        {
            try
            {
                var userId = GetUserId();
                await _maintenanceService.MarkReminderReadAsync(userId, reminderId);
                return Ok(new { message = "Reminder marked as read" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to mark reminder as read", details = ex.Message });
            }
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteMaintenanceTask([FromBody] MaintenanceCompletionRequest request)
        {
            try
            {
                var userId = GetUserId();
                await _maintenanceService.CompleteMaintenanceAsync(userId, request);
                return Ok(new { message = "Maintenance task completed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to complete maintenance task", details = ex.Message });
            }
        }

        [HttpGet("due-soon")]
        public async Task<IActionResult> GetUpcomingMaintenance()
        {
            try
            {
                var userId = GetUserId();
                var upcoming = await _maintenanceService.GetUpcomingMaintenanceAsync(userId);
                return Ok(upcoming);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to retrieve upcoming maintenance", details = ex.Message });
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }
    }

    // Additional request model for maintenance completion
    public class MaintenanceCompletionRequest
    {
        public int ScheduleId { get; set; }
        public int VehicleId { get; set; }
        public DateTime CompletedDate { get; set; }
        public int? Mileage { get; set; }
        public string Notes { get; set; } = string.Empty;
        public decimal? Cost { get; set; }
    }
}