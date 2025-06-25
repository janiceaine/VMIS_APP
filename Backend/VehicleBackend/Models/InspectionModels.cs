using System.ComponentModel.DataAnnotations;

namespace VMIS.Models
{
    public class InspectionTemplate
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Pre-trip, Post-trip, Annual, etc.
        public string Description { get; set; } = string.Empty;
        public List<InspectionCategory> Categories { get; set; } = new List<InspectionCategory>();
        public bool IsDefault { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class InspectionCategory
    {
        public int Id { get; set; }
        public int TemplateId { get; set; }
        public string Name { get; set; } = string.Empty; // Engine, Tires, Lights, etc.
        public List<InspectionItem> Items { get; set; } = new List<InspectionItem>();
        public int SortOrder { get; set; }
    }

    public class InspectionItem
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InputType { get; set; } = "checkbox"; // checkbox, rating, text
        public bool IsRequired { get; set; } = true;
        public int SortOrder { get; set; }
    }

    public class InspectionRecord
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public int TemplateId { get; set; }
        public int UserId { get; set; }
        public DateTime InspectionDate { get; set; }
        public int? Mileage { get; set; }
        public string OverallStatus { get; set; } = "Pass"; // Pass, Fail, Needs Attention
        public string Notes { get; set; } = string.Empty;
        public List<InspectionResult> Results { get; set; } = new List<InspectionResult>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class InspectionResult
    {
        public int Id { get; set; }
        public int InspectionRecordId { get; set; }
        public int ItemId { get; set; }
        public string Value { get; set; } = string.Empty; // checkbox: true/false, rating: 1-5, text: comment
        public string Status { get; set; } = "Pass"; // Pass, Fail, N/A
        public string Comments { get; set; } = string.Empty;
        public string? PhotoPath { get; set; }
    }

    public class InspectionRequest
    {
        [Required]
        public int VehicleId { get; set; }

        [Required]
        public int TemplateId { get; set; }

        public int? Mileage { get; set; }
        public string Notes { get; set; } = string.Empty;
        public List<InspectionResultRequest> Results { get; set; } = new List<InspectionResultRequest>();
    }

    public class InspectionResultRequest
    {
        [Required]
        public int ItemId { get; set; }

        [Required]
        public string Value { get; set; } = string.Empty;

        public string Status { get; set; } = "Pass";
        public string Comments { get; set; } = string.Empty;
        public string? PhotoPath { get; set; }
    }
}
