using System.ComponentModel.DataAnnotations;

namespace VMIS.Models
{
    public class MaintenanceSchedule
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public string MaintenanceType { get; set; } = string.Empty; // Oil Change, Tire Rotation, etc.
        public int? IntervalMiles { get; set; } // Miles between maintenance
        public int? IntervalMonths { get; set; } // Months between maintenance
        public DateTime? LastPerformed { get; set; }
        public DateTime? NextDue { get; set; }
        public int? LastMileage { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class MaintenanceScheduleRequest
    {
        [Required]
        public int VehicleId { get; set; }

        [Required]
        public string MaintenanceType { get; set; } = string.Empty;

        public int? IntervalMiles { get; set; }
        public int? IntervalMonths { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class MaintenanceReminder
    {
        public int Id { get; set; }
        public int ScheduleId { get; set; }
        public int VehicleId { get; set; }
        public int UserId { get; set; }
        public string MaintenanceType { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public int? DueMileage { get; set; }
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
