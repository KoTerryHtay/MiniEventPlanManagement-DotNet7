using AutoMapper;
using MiniEventPlanManagement.Database.Models;
using MiniEventPlanManagement.Domain.Models.Dto;
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
            .ForMember(dest => dest.GuestAssignments, opt => opt.MapFrom(src => src.TblGuestAssignments));

        // TblGuest -> GuestDto
        CreateMap<TblGuest, GuestDto>();
    }
}