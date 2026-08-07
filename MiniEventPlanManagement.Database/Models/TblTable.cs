using System;
using System.Collections.Generic;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblTable
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Capacity { get; set; }

    public virtual ICollection<TblGuest> TblGuests { get; set; } = new List<TblGuest>();
}
