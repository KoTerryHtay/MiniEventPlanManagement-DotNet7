using MiniEventPlanManagement.Database.Models;

namespace MiniEventPlanManagement.Domain.Models.Dto;

public class EventDto
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime EventDate { get; set; }

    public DateTime CreatedDate { get; set; }

    //public List<GuestDto> Guests { get; set; } = new();
    public List<TableDto> Tables { get; set; } = new();
}

