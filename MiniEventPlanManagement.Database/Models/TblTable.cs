using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblTable
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Capacity { get; set; }

    public int EventId { get; set; }

    public virtual TblEvent Event { get; set; } = null!;

    public virtual ICollection<TblGuestAssignment> TblGuestAssignments { get; set; } = new List<TblGuestAssignment>();
}
