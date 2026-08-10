using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

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

    //[JsonIgnore]
    public virtual TblEvent Event { get; set; } = null!;

    //[JsonIgnore]
    public virtual TblTable Table { get; set; } = null!;
}
