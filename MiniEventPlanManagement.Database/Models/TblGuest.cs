using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblGuest
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public virtual ICollection<TblGuestAssignment> TblGuestAssignments { get; set; } = new List<TblGuestAssignment>();
}
