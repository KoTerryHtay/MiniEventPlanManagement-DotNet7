using Microsoft.AspNetCore.Mvc;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Features.Event;
using MiniEventPlanManagement.Mvc.Models;

namespace MiniEventPlanManagement.Mvc.Controllers;

public class EventsController : Controller
{
    private readonly EventService _eventService;

    public EventsController(EventService eventService)
    {
        _eventService = eventService;
    }

    public IActionResult Index()
    {
        var data = _eventService.GetAllEvents();

        return View("Events", data.Data);
    }

    [Route("/events/new")]
    public IActionResult CreateEvent()
    {
        return View("CreateEvent");
    }

    [HttpPost]
    [Route("api/events/create")]
    public IActionResult CreateEvent(EventRequestModel requestModel)
    {
        MessageModel model;
        try
        {
            _eventService.CreateEvent(new TblEvent
            {
                Name = requestModel.Name,
                EventDate = requestModel.EventDate,
                UserId = 1
            });
            model = new MessageModel(true, "Event Created Successfully");
        }
        catch (Exception ex)
        {
            model = new MessageModel(false, ex.ToString());
        }

        return Json(model);
    }

    [Route("/events/{id:int}")]
    public IActionResult EventDetail(int id)
    {
        var data = _eventService.GetEventById(id);

        return View("EventDetail", data.Data);
    }

    //[Route("/api/events/{id:int}")]
    //public IActionResult Detail(int id)
    //{
    //    MessageModel model;
    //    var data = _eventService.GetEventById(id);
    //    if (data.Data is null)
    //    {
    //        model = new MessageModel(false, "Event not found");
    //        goto Results;
    //    }

    //    model = new MessageModel(true, "Get Event successfully", data.Data);

    //Results:
    //    return Json(model);
    //}
}
