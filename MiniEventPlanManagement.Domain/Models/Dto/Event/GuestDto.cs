using MiniEventPlanManagement.Database.Models;

namespace MiniEventPlanManagement.Domain.Models.Dto.Event;

public class GuestDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string RsvpStatus { get; set; } = null!;

    public bool IsCheckdIn { get; set; }

    public DateTime? CheckedInAt { get; set; }
}
