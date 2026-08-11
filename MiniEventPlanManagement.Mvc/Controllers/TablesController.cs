using Microsoft.AspNetCore.Mvc;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Features.Event;
using MiniEventPlanManagement.Domain.Features.Table;
using MiniEventPlanManagement.Mvc.Models;

namespace MiniEventPlanManagement.Mvc.Controllers;

public class TablesController : Controller
{
    private readonly TableService _tableService;

    public TablesController(TableService tableService)
    {
        _tableService = tableService;
    }

    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    [Route("api/tables/create")]
    public IActionResult CreateTable(TableRequestModel requestModel)
    {
        MessageModel model;
        try
        {
            _tableService.CreateTable(new TblTable
            {
                Name = requestModel.Name,
                EventId = requestModel.EventId
            });
            model = new MessageModel(true, "Table Created Successfully");
        }
        catch (Exception ex)
        {
            model = new MessageModel(false, ex.ToString());
        }

        return Json(model);
    }
}
