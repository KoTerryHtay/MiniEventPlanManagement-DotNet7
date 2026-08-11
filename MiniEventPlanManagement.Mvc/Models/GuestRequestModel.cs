namespace MiniEventPlanManagement.Mvc.Models;

public class GuestRequestModel
{
    public int? Id { get; set; }
    public string FullName { get; set; } = null!;
    public int? TableId { get; set; }
    public int? EventId { get; set; }
}
