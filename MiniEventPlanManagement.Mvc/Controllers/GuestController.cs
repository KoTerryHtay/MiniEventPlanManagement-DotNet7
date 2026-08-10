using Microsoft.AspNetCore.Mvc;
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

    [HttpPost]
    [Route("/api/guest/rsvp")]
    public IActionResult UpdateRSVP(RsvpRequestModel requestModel)
    {
        MessageModel model;
        var data = _guestService.UpdateGuestRsvp(requestModel.Id, requestModel.TableId, requestModel.RsvpStatus);
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
