using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MiniEventPlanManagement.Database.Models;

public partial class TblEvent
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime EventDate { get; set; }

    public DateTime CreatedDate { get; set; }

    public int UserId { get; set; }

    //[JsonIgnore]
    public virtual ICollection<TblGuest> TblGuests { get; set; } = new List<TblGuest>();

    public virtual ICollection<TblTable> TblTables { get; set; } = new List<TblTable>();

    //[JsonIgnore]
    public virtual TblUser User { get; set; } = null!;
}
