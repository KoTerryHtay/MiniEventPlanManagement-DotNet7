using MiniEventPlanManagement.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniEventPlanManagement.Domain.Models.Dto;

public class GuestAssignmentDto
{
    public int Id { get; set; }

    public int GuestId { get; set; }
    public string GuestName { get; set; } = null!;

    public int EventId { get; set; }
    public string EventName { get; set; } = null!;

    public int TableId { get; set; }
    public string TableName { get; set; } = null!;

    public string RsvpStatus { get; set; } = null!;

    public bool IsCheckedIn { get; set; }

    public DateTime? CheckedInAt { get; set; }
}
