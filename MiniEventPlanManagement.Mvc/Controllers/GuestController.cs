using Microsoft.AspNetCore.Mvc;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Features.Event;
using MiniEventPlanManagement.Domain.Features.Guest;
using MiniEventPlanManagement.Mvc.Models;

namespace MiniEventPlanManagement.Mvc.Controllers;

public class GuestController : Controller
{
    private readonly GuestService _guestService;

    public GuestController(GuestService guestService)
    {
        _guestService = guestService;
    }

    public IActionResult Index()
    {
        return View();
    }

    [Route("/guests")]
    public IActionResult AllGuests()
    {
        var data = _guestService.GetAllGuests();

        return View("AllGuests", data.Data);
    }

    [HttpPost]
    [Route("/api/guests/create")]
    public IActionResult CreateGuest(GuestRequestModel requestModel)
    {
        MessageModel model;
        try
        {
            var data = _guestService.CreateGuest(new TblGuest
            {
                FullName = requestModel.FullName
            });
            model = new MessageModel(true, "Guest Created Successfully", data);
        }
        catch (Exception ex)
        {
            model = new MessageModel(false, ex.ToString());
        }

        return Json(model);
    }

    [HttpPost]
    [Route("/api/guests/assign")]
    public IActionResult AssignGuest(GuestRequestModel requestModel)
    {
        MessageModel model;
        try
        {
            _guestService.AssignGuest((int)requestModel.Id!, (int)requestModel.TableId!, (int)requestModel.EventId!);
            model = new MessageModel(true, "Assign Guest Successfully");
        }
        catch (Exception ex)
        {
            model = new MessageModel(false, ex.ToString());
        }

        return Json(model);
    }

    [Route("/api/guests/{id:int}")]
    public IActionResult GetGuest(int id)
    {
        MessageModel model;
        var data = _guestService.GetGuestById(id);

        if (data.Data is null)
        {
            model = new MessageModel(false, "Guest not found");
            goto Results;
        }

        model = new MessageModel(true, "Guest get successfully", data.Data);

    Results:
        return Json(model);
    }

    [Route("/api/guests/check-event/{eventId:int}")]
    public IActionResult GetGuestsNotInTableByTableId(int eventId)
    {
        MessageModel model;
        var data = _guestService.GetGuestsNotInTableByEventId(eventId);

        Console.WriteLine(data.Data.Count);

        if (data.Data is null)
        {
            model = new MessageModel(false, "Guest not found");
            goto Results;
        }

        model = new MessageModel(true, "Guest get successfully", data.Data);

    Results:
        return Json(model);
    }

    [HttpPost]
    [Route("/api/guest/rsvp")]
    public IActionResult UpdateRSVP(RsvpRequestModel requestModel)
    {
        MessageModel model;

        var data = _guestService
            .UpdateGuestRsvp(requestModel.Id,
                            requestModel.TableId,
                            requestModel.RsvpStatus);
        if (data.IsSuccess is not true)
        {
            model = new MessageModel(false, "Something wrong");
            goto Results;
        }

        model = new MessageModel(true, "Guest RSVP updated successfully", data.Data);

    Results:
        return Json(model);
    }

    [HttpPost]
    [Route("/api/guest/checkin")]
    public IActionResult GuestCheckIn(CheckInRequestModel requestModel)
    {
        MessageModel model;
        var data = _guestService.GuestCheckIn(requestModel.Id, requestModel.TableId, requestModel.IsCheckdIn);
        if (data.IsSuccess is not true)
        {
            model = new MessageModel(false, "Something wrong");
            goto Results;
        }

        model = new MessageModel(true, "Guest CheckIn updated successfully", data.Data);

    Results:
        return Json(model);
    }
}
