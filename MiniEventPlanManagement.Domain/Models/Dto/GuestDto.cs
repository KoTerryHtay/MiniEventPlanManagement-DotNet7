using MiniEventPlanManagement.Database.Models;

namespace MiniEventPlanManagement.Domain.Models.Dto;

public class GuestDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public List<GuestAssignmentDto> GuestAssignments { get; set; } = new();

}
