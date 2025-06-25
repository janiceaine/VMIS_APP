namespace VMIS.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public string? OwnerName { get; set; }
        public string? LicensePlate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class VehicleRequest
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; } = DateTime.Now.Year;
        public string VehicleType { get; set; } = string.Empty;
        public string? OwnerName { get; set; }
        public string? LicensePlate { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? PolicyNumber { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }
}