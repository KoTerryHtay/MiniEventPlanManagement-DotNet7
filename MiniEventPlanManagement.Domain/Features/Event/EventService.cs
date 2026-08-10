using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Models.Dto.Event;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace MiniEventPlanManagement.Domain.Features.Event;

public class EventService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;


    public EventService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public Result<List<TblEvent>> GetAllEvents()
    {

        Result<List<TblEvent>> model;

        var allEvents = _db.TblEvents.AsNoTracking().ToList();
        model = Result<List<TblEvent>>.Success(allEvents);

        return model;
    }

    public Result<EventDto> GetEventById(int id)
    {

        Result<EventDto> model;
        var tableData = _db.TblEvents.AsNoTracking().FirstOrDefault(x => x.Id == id);

        //var data = _db.TblEvents.AsNoTracking()
        //    .Select(x => new EventDto
        //    {
        //        Id = x.Id,
        //        Name = x.Name,
        //        EventDate = x.EventDate,
        //        CreatedDate = x.CreatedDate,

        //        Tables = x.TblTables
        //            .Select(t => new TableDto
        //            {
        //                Id = t.Id,
        //                Name = t.Name,
        //                Capacity = t.Capacity,
        //                Guests = new GuestDto { }

        //                //_db.TblTables.AsNoTracking().Where(x => x.EventId == id).ToList()
        //                //t.TblGuests.Select(tg => new GuestDto
        //                //{
        //                //    Id = tg.Id,
        //                //    FullName = tg.FullName,
        //                //    Phone = tg.Phone,
        //                //    RsvpStatus = tg.RsvpStatus,
        //                //    IsCheckdIn = tg.IsCheckdIn,
        //                //    CheckedInAt = tg.CheckedInAt,
        //                //}).ToList(),

        //            }).ToList()
        //    .ToList(),
        //    })
        //    .FirstOrDefault(x => x.Id == id);

        var eventEntity = _db.TblEvents
            .AsNoTracking()
            .Include(e => e.TblTables)
                .ThenInclude(t => t.TblGuests)
            .FirstOrDefault(x => x.Id == id);

        var data = _mapper.Map<EventDto>(eventEntity);


        if (data is null)
        {
            model = Result<EventDto>.NotFound();
            goto Result;
        }

        model = Result<EventDto>.Success(data);

    Result:
        return model;
    }

    public TblEvent CreateEvent(TblEvent data)
    {
        _db.TblEvents.Add(data);
        _db.SaveChanges();
        return data;
    }
}
