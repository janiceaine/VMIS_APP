namespace VehicleBackend.Models
{
    public class CombinedRequest
    {
        public string Make { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }

        public string MaintenanceTask { get; set; }
        public DateTime MaintenanceDate { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime PolicyExpiration { get; set; }
    }
}