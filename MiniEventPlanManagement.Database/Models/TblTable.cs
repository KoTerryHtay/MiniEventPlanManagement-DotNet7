using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblTable
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Capacity { get; set; }

    public int EventId { get; set; }

    //[JsonIgnore]
    public virtual TblEvent Event { get; set; } = null!;

    public virtual ICollection<TblGuest> TblGuests { get; set; } = new List<TblGuest>();
}
