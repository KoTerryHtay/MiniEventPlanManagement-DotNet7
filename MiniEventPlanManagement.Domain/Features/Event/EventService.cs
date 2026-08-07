using Microsoft.EntityFrameworkCore;
using MiniEventPlanManagement.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniEventPlanManagement.Domain.Features.Event;

public class EventService
{
    private readonly AppDbContext _db;

    public EventService(AppDbContext db)
    {
        _db = db;
    }

    public Result<List<TblEvent>> GetAllEvents()
    {

        Result<List<TblEvent>> model;

        var allEvents = _db.TblEvents.AsNoTracking().ToList();
        model = Result<List<TblEvent>>.Success(allEvents);

        return model;
    }

    public Result<TblEvent> GetEventById(int id)
    {

        Result<TblEvent> model;

        var data = _db.TblEvents.AsNoTracking().FirstOrDefault(x => x.Id == id);

        if (data is null)
        {
            model = Result<TblEvent>.NotFound();
            goto Result;
        }

        model = Result<TblEvent>.Success(data);

    Result:
        return model;
    }

    public TblEvent CreateSale(TblEvent data)
    {
        _db.TblEvents.Add(data);
        _db.SaveChanges();
        return data;
    }
}
