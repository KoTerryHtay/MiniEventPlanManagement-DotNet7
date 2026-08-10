using AutoMapper;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Models.Dto.Event;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MiniEventPlanManagement.Domain.Mappings;


public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // TblEvent -> EventDto
        CreateMap<TblEvent, EventDto>()
            .ForMember(dest => dest.Tables, opt => opt.MapFrom(src => src.TblTables));

        // TblTable -> TableDto
        CreateMap<TblTable, TableDto>()
            .ForMember(dest => dest.Guests, opt => opt.MapFrom(src => src.TblGuests));

        // TblGuest -> GuestDto
        CreateMap<TblGuest, GuestDto>();
    }
}