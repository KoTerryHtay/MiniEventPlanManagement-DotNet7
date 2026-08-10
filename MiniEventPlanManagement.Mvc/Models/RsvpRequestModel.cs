namespace MiniEventPlanManagement.Mvc.Models;

public class RsvpRequestModel
{
    // Id RsvpStatus TableId
    public int Id { get; set; }
    public string RsvpStatus { get; set; } = null!;

    public int TableId { get; set; }
}
