using Microsoft.EntityFrameworkCore;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Models.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniEventPlanManagement.Domain.Features.Guest;

public class GuestService
{
    private readonly AppDbContext _db;

    public GuestService(AppDbContext db)
    {
        _db = db;
    }

    public Result<List<TblGuest>> GetAllGuests()
    {

        Result<List<TblGuest>> model;

        var guests = _db.TblGuests.AsNoTracking().ToList();
        model = Result<List<TblGuest>>.Success(guests);

        return model;
    }

    public Result<TblGuest> GetGuestById(int id)
    {

        Result<TblGuest> model;

        var data = _db.TblGuests.AsNoTracking().FirstOrDefault(x => x.Id == id);

        if (data is null)
        {
            model = Result<TblGuest>.NotFound();
            goto Result;
        }

        model = Result<TblGuest>.Success(data);

    Result:
        return model;
    }

    public Result<List<GuestAssignmentDto>> GetGuestsByTableId(int tableId)
    {

        Result<List<GuestAssignmentDto>> model;

        var data = _db.TblGuestAssignments
        .AsNoTracking()
        .Where(x => x.TableId == tableId)
        .Select(a => new GuestAssignmentDto
        {
            Id = a.Id,
            GuestId = a.GuestId,
            GuestName = a.Guest.FullName,
            EventId = a.EventId,
            EventName = a.Event.Name,
            TableId = a.TableId,
            TableName = a.Table.Name,
            RsvpStatus = a.RsvpStatus,
            IsCheckedIn = a.IsCheckedIn,
            CheckedInAt = a.CheckedInAt
        })
        .ToList();

        if (data is null)
        {
            model = Result<List<GuestAssignmentDto>>.NotFound();
            goto Result;
        }

        model = Result<List<GuestAssignmentDto>>.Success(data);

    Result:
        return model;
    }

    public Result<List<GuestDto>> GetGuestsNotInTableByEventId(int eventId)
    {

        Result<List<GuestDto>> model;

        var data = _db.TblGuests
            .AsNoTracking()
            .Where(x => !x.TblGuestAssignments
                 .Any(a => a.EventId == eventId))
            .Select(g => new GuestDto
            {
                Id = g.Id,
                FullName = g.FullName,
                Phone = g.Phone
            })
            .ToList();

        if (data is null)
        {
            model = Result<List<GuestDto>>.NotFound();
            goto Result;
        }

        model = Result<List<GuestDto>>.Success(data);

    Result:
        return model;
    }

    public TblGuest CreateGuest(TblGuest data)
    {
        _db.TblGuests.Add(data);
        _db.SaveChanges();
        return data;
    }

    public Result<TblGuest> UpdateGuest(int id, TblGuest data)
    {
        Result<TblGuest> model;

        var item = _db.TblGuests.AsNoTracking().FirstOrDefault(x => x.Id == id);
        if (item is null)
        {
            model = Result<TblGuest>.NotFound();
            goto Result;
        }

        // FullName Phone RsvpStatus IsCheckdIn CheckedInAt TableId EventId     
        item.FullName = data.FullName;
        item.Phone = data.Phone;

        _db.Entry(item).State = EntityState.Modified;
        _db.SaveChanges();

        model = Result<TblGuest>.Success(item);

    Result:
        return model;
    }

    public Result<GuestAssignmentDto> UpdateGuestRsvp(int guestId, int tableId, string rsvp)
    {
        Result<GuestAssignmentDto> model;

        if (!Enum.TryParse<RSVP>(rsvp, true, out RSVP rsvpEnum))
        {
            model = Result<GuestAssignmentDto>.ValidationError("Invalid RSVP status. Please use Pending, Confirmed, Declined, or Waitlist.");
            goto Result;
        }


        var assignment = _db.TblGuestAssignments
            .AsNoTracking()
            .Include(a => a.Event)
            .Include(a => a.Table)
            .Include(a => a.Guest)
            .FirstOrDefault(x => x.GuestId == guestId && x.TableId == tableId);

        if (assignment is null)
        {
            model = Result<GuestAssignmentDto>.NotFound();
            goto Result;
        }

        // FullName Phone RsvpStatus IsCheckdIn CheckedInAt TableId EventId
        assignment.RsvpStatus = rsvp.Trim();

        _db.Entry(assignment).State = EntityState.Modified;
        _db.SaveChanges();

        var dto = new GuestAssignmentDto
        {
            Id = assignment.Id,
            GuestId = assignment.GuestId,
            GuestName = assignment.Guest.FullName,
            EventId = assignment.EventId,
            EventName = assignment.Event.Name,
            TableId = assignment.TableId,
            TableName = assignment.Table.Name,
            RsvpStatus = assignment.RsvpStatus,
            IsCheckedIn = assignment.IsCheckedIn,
            CheckedInAt = assignment.CheckedInAt
        };

        model = Result<GuestAssignmentDto>.Success(dto);

    Result:
        return model;
    }

    public Result<GuestAssignmentDto> GuestCheckIn(int guestId, int tableId, bool check)
    {
        Result<GuestAssignmentDto> model;

        var assignment = _db.TblGuestAssignments
        .Include(a => a.Guest)
        .Include(a => a.Event)
        .Include(a => a.Table)
        .FirstOrDefault(a => a.GuestId == guestId && a.TableId == tableId);

        if (assignment is null)
        {
            model = Result<GuestAssignmentDto>.NotFound();
            goto Result;
        }

        // FullName Phone RsvpStatus IsCheckdIn CheckedInAt TableId EventId
        assignment.IsCheckedIn = check;
        assignment.CheckedInAt = check ? DateTime.Now : null;

        _db.Entry(assignment).State = EntityState.Modified;
        _db.SaveChanges();

        var dto = new GuestAssignmentDto
        {
            Id = assignment.Id,
            GuestId = assignment.GuestId,
            GuestName = assignment.Guest.FullName,
            EventId = assignment.EventId,
            EventName = assignment.Event.Name,
            TableId = assignment.TableId,
            TableName = assignment.Table.Name,
            RsvpStatus = assignment.RsvpStatus,
            IsCheckedIn = assignment.IsCheckedIn,
            CheckedInAt = assignment.CheckedInAt
        };

        model = Result<GuestAssignmentDto>.Success(dto);

    Result:
        return model;
    }

    public Result<GuestAssignmentDto> AssignGuest(int guestId, int tableId, int eventId)
    {
        Result<GuestAssignmentDto> model;

        var guest = _db.TblGuests.AsNoTracking().FirstOrDefault(x => x.Id == guestId);
        if (guest is null)
        {
            model = Result<GuestAssignmentDto>.NotFound();
            goto Result;
        }

        // Check if assignment already exists
        var existing = _db.TblGuestAssignments
            .FirstOrDefault(a => a.GuestId == guestId && a.TableId == tableId && a.EventId == eventId);

        if (existing != null)
        {
            // Already assigned to this table
            var dto = MapToDto(existing);
            return Result<GuestAssignmentDto>.Success(dto);
        }

        // Remove old assignments for this guest in this event (reassign)
        var oldAssignments = _db.TblGuestAssignments
            .Where(x => x.GuestId == guestId && x.EventId == eventId)
            .ToList();
        if (oldAssignments.Any())
            _db.TblGuestAssignments.RemoveRange(oldAssignments);

        var newAssignment = new TblGuestAssignment
        {
            GuestId = guestId,
            TableId = tableId,
            EventId = eventId,
            RsvpStatus = "Pending",
            IsCheckedIn = false,
            CheckedInAt = null
        };


        //_db.Entry(newAssignment).State = EntityState.Modified;
        _db.TblGuestAssignments.Add(newAssignment);
        _db.SaveChanges();

        // Reload with navigation properties for DTO mapping
        _db.Entry(newAssignment).Reference(a => a.Guest).Load();
        _db.Entry(newAssignment).Reference(a => a.Event).Load();
        _db.Entry(newAssignment).Reference(a => a.Table).Load();

        var resultDto = MapToDto(newAssignment);

        model = Result<GuestAssignmentDto>.Success(resultDto);

    Result:
        return model;
    }

    private GuestAssignmentDto MapToDto(TblGuestAssignment a)
    {
        return new GuestAssignmentDto
        {
            Id = a.Id,
            GuestId = a.GuestId,
            GuestName = a.Guest?.FullName ?? string.Empty,
            EventId = a.EventId,
            EventName = a.Event?.Name ?? string.Empty,
            TableId = a.TableId,
            TableName = a.Table?.Name ?? string.Empty,
            RsvpStatus = a.RsvpStatus ?? "Pending",
            IsCheckedIn = a.IsCheckedIn,
            CheckedInAt = a.CheckedInAt
        };
    }
}


enum RSVP
{
    Pending,
    Confirmed,
    Declined,
    Waitlist,
}