using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblGuestAssignment
{
    public int Id { get; set; }

    public int GuestId { get; set; }

    public int EventId { get; set; }

    public int TableId { get; set; }

    public string RsvpStatus { get; set; } = null!;

    public bool IsCheckedIn { get; set; }

    public DateTime? CheckedInAt { get; set; }

    public virtual TblEvent Event { get; set; } = null!;

    public virtual TblGuest Guest { get; set; } = null!;

    public virtual TblTable Table { get; set; } = null!;
}
