using Microsoft.EntityFrameworkCore;
using MiniEventPlanManagement.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MiniEventPlanManagement.Domain.Features.Table;

public class TableService
{

    private readonly AppDbContext _db;

    public TableService(AppDbContext db)
    {
        _db = db;
    }

    public Result<List<TblTable>> GetAllTables()
    {

        Result<List<TblTable>> model;

        var allTables = _db.TblTables.AsNoTracking().ToList();
        model = Result<List<TblTable>>.Success(allTables);

        return model;
    }

    public Result<TblTable> GetTableById(int id)
    {

        Result<TblTable> model;

        var data = _db.TblTables.AsNoTracking().FirstOrDefault(x => x.Id == id);

        if (data is null)
        {
            model = Result<TblTable>.NotFound();
            goto Result;
        }

        model = Result<TblTable>.Success(data);

    Result:
        return model;
    }

    public TblTable CreateTable(TblTable data)
    {
        _db.TblTables.Add(data);
        _db.SaveChanges();
        return data;
    }

    public Result<TblTable> UpdateTable(int id, TblTable data)
    {
        Result<TblTable> model;

        var item = _db.TblTables.AsNoTracking().FirstOrDefault(x => x.Id == id);
        if (item is null)
        {
            model = Result<TblTable>.NotFound();
            goto Result;
        }

        item.Name = data.Name;
        item.Capacity = data.Capacity;
        item.EventId = data.EventId;

        _db.Entry(item).State = EntityState.Modified;
        _db.SaveChanges();

        model = Result<TblTable>.Success(item);

    Result:
        return model;
    }
}
