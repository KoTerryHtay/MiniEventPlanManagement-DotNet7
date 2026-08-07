using MiniEventPlanManagement.Database.Models;

namespace MiniEventPlanManagement.Mvc.Models;

public class EventRequestModel
{
    public string Name { get; set; }

    public DateTime EventDate { get; set; }

    public int UserId { get; set; }

}
