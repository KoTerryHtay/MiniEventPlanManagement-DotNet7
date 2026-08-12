using MiniEventPlanManagement.Database.Models;
using System.Text.Json.Serialization;

namespace MiniEventPlanManagement.Domain.Models.Dto;

public class TableDto
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Capacity { get; set; }

    public List<GuestAssignmentDto> GuestAssignments { get; set; } = new();

    //[JsonIgnore]
    //public virtual TblEvent Event { get; set; } = null!;
}
