namespace VMIS.Models
{
    public class MaintenanceRecord
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public string Task { get; set; }
        public DateTime MaintenanceDate { get; set; }
        public int? Mileage { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MaintenanceRequest
    {
        public int VehicleId { get; set; }
        public string MaintenanceTask { get; set; }
        public DateTime MaintenanceDate { get; set; }
        public int? Mileage { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime? PolicyExpiration { get; set; }
    }
} 