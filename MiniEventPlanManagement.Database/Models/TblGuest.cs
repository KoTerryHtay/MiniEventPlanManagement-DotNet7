using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblGuest
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string RsvpStatus { get; set; } = null!;

    public bool IsCheckdIn { get; set; }

    public DateTime? CheckedInAt { get; set; }

    public int TableId { get; set; }

    public int EventId { get; set; }

    public virtual TblEvent Event { get; set; } = null!;
}

enum RSVP
{
    Pending,
    Confirmed,
    Declined,
    Waitlist,
}