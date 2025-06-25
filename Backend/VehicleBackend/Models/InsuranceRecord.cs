namespace VMIS.Models
{
    public class InsuranceRecord
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public string PolicyNumber { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string Provider { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}