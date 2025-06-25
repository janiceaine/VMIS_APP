using System.ComponentModel.DataAnnotations;

namespace VMIS.Models
{
    public class RepairRecord
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public DateTime RepairDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public int? Mileage { get; set; }
        public string? MechanicName { get; set; }
        public string? GarageName { get; set; }
        public string? GarageAddress { get; set; }
        public string? GaragePhone { get; set; }
        public string? ReceiptPath { get; set; }
        public string Category { get; set; } = "General"; // Engine, Transmission, Brakes, etc.
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Emergency
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class RepairRecordRequest
    {
        [Required]
        public int VehicleId { get; set; }

        [Required]
        public DateTime RepairDate { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Cost { get; set; }

        public int? Mileage { get; set; }
        public string? MechanicName { get; set; }
        public string? GarageName { get; set; }
        public string? GarageAddress { get; set; }
        public string? GaragePhone { get; set; }
        public string Category { get; set; } = "General";
        public string Priority { get; set; } = "Medium";
    }

    public class MileageRecord
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public DateTime RecordDate { get; set; }
        public int Mileage { get; set; }
        public string RecordType { get; set; } = "Manual"; // Manual, GPS, Service
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ServiceProvider
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string ServiceTypes { get; set; } = string.Empty; // JSON array of services
        public decimal? Rating { get; set; }
        public int ReviewCount { get; set; } = 0;
        public bool IsPreferred { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ServiceProviderRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public string? Email { get; set; }
        public string? Website { get; set; }
        public List<string> ServiceTypes { get; set; } = new List<string>();
        public decimal? Rating { get; set; }
    }
}
