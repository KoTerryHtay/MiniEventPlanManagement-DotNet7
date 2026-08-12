using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblEvent
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime EventDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public int UserId { get; set; }

    public virtual ICollection<TblGuestAssignment> TblGuestAssignments { get; set; } = new List<TblGuestAssignment>();

    public virtual ICollection<TblTable> TblTables { get; set; } = new List<TblTable>();

    public virtual TblUser User { get; set; } = null!;
}
