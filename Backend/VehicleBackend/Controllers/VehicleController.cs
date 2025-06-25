using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VMIS.Models;
using VMIS.Services;
using System.Security.Claims;

namespace VMIS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehicleController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetVehicles()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var vehicles = await _vehicleService.GetVehiclesAsync(userId);
                return Ok(vehicles);
            }
            catch
            {
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleRequest request)
        {
            try
            {
                Console.WriteLine($"AddVehicle called with request: {System.Text.Json.JsonSerializer.Serialize(request)}");
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                Console.WriteLine($"User ID: {userId}");
                var vehicleId = await _vehicleService.AddVehicleAsync(userId, request);
                Console.WriteLine($"Vehicle created with ID: {vehicleId}");

                return Ok(new { message = "Vehicle added successfully", vehicleId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddVehicle: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new
                {
                    error = "Internal server error",
                    details = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace?.Substring(0, Math.Min(500, ex.StackTrace.Length))
                });
            }
        }

        [HttpPost("maintenance")]
        public async Task<IActionResult> AddMaintenance([FromBody] MaintenanceRequest request)
        {
            try
            {
                await _vehicleService.AddMaintenanceRecordAsync(request);

                return Ok(new
                {
                    message = "Maintenance record saved successfully",
                    task = request.MaintenanceTask,
                    maintenanceDate = request.MaintenanceDate,
                    policyExpiration = request.PolicyExpiration
                });
            }
            catch
            {
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var data = await _vehicleService.GetDashboardDataAsync(userId);

                return Ok(data);
            }
            catch
            {
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("test")]
        public IActionResult TestEndpoint()
        {
            return Ok(new { message = "Test endpoint working", timestamp = DateTime.UtcNow });
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var result = await _vehicleService.TestConnectionAsync();
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var vehicles = await _vehicleService.GetVehiclesAsync(userId);
                var vehicle = vehicles.FirstOrDefault(v => v.Id == id);
                
                if (vehicle == null)
                {
                    return NotFound(new { error = "Vehicle not found" });
                }
                
                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetVehicle: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] VehicleRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                await _vehicleService.UpdateVehicleAsync(id, userId, request);
                return Ok(new { message = "Vehicle updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateVehicle: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                await _vehicleService.DeleteVehicleAsync(id, userId);
                return Ok(new { message = "Vehicle deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteVehicle: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }
    }
}