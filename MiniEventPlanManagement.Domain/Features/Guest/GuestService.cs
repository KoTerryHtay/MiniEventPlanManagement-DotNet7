using Microsoft.EntityFrameworkCore;
using MiniEventPlanManagement.Database.Models;
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
        item.TableId = data.TableId;
        item.EventId = data.EventId;

        _db.Entry(item).State = EntityState.Modified;
        _db.SaveChanges();

        model = Result<TblGuest>.Success(item);

    Result:
        return model;
    }

    public Result<TblGuest> UpdateGuestRsvp(int guestId, int tableId, string rsvp)
    {
        Result<TblGuest> model;

        if (!Enum.TryParse<RSVP>(rsvp, true, out RSVP rsvpEnum))
        {
            model = Result<TblGuest>.ValidationError("Invalid RSVP status. Please use Pending, Confirmed, Declined, or Waitlist.");
            goto Result;
        }


        var item = _db.TblGuests.AsNoTracking().FirstOrDefault(x => x.Id == guestId && x.TableId == tableId);

        if (item is null)
        {
            model = Result<TblGuest>.NotFound();
            goto Result;
        }

        // FullName Phone RsvpStatus IsCheckdIn CheckedInAt TableId EventId
        item.RsvpStatus = rsvp;

        _db.Entry(item).State = EntityState.Modified;
        _db.SaveChanges();

        model = Result<TblGuest>.Success(item);

    Result:
        return model;
    }

    public Result<TblGuest> GuestCheckIn(int guestId, int tableId, bool check)
    {
        Result<TblGuest> model;

        var item = _db.TblGuests.AsNoTracking().FirstOrDefault(x => x.Id == guestId && x.TableId == tableId);
        if (item is null)
        {
            model = Result<TblGuest>.NotFound();
            goto Result;
        }

        // FullName Phone RsvpStatus IsCheckdIn CheckedInAt TableId EventId
        item.IsCheckdIn = check;
        item.CheckedInAt = DateTime.Now;

        _db.Entry(item).State = EntityState.Modified;
        _db.SaveChanges();

        model = Result<TblGuest>.Success(item);

    Result:
        return model;
    }
}
enum RSVP
{
    Pending,
    Confirmed,
    Declined,
    Waitlist,
}