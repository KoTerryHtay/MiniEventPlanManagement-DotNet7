namespace MiniEventPlanManagement.Mvc.Models;

public class CheckInRequestModel
{
    // Id IsCheckdIn TableId
    public int Id { get; set; }

    public bool IsCheckdIn { get; set; }

    public int TableId { get; set; }
}
