using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Models;

namespace SHM_MS.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StatusHistoryController(SHMContext context) : ControllerBase
{
    [HttpGet("vm")]
    public async Task<ActionResult<IEnumerable<VmStatusHistoriesResponseDto>>> GetVmStatusHistories(
        Instant from,
        Instant until
    )
    {
        var rangeHistories = await context
            .VmStatusHistories.Where(h => h.Timestamp >= from && h.Timestamp <= until)
            .ToListAsync();

        var priorHistories = await context
            .VmStatusHistories.Where(h => h.Timestamp < from)
            .GroupBy(h => h.VmId)
            .Select(group => group.OrderByDescending(h => h.Timestamp).First())
            .ToListAsync();

        return rangeHistories
            .Concat(priorHistories)
            .GroupBy(
                h => h.VmId,
                (key, histories) =>
                    new VmStatusHistoriesResponseDto()
                    {
                        VmId = key,
                        Histories = histories.OrderBy(h => h.Timestamp).ToList(),
                    }
            )
            .ToList();
    }

    [HttpGet("system")]
    public async Task<ActionResult<IEnumerable<SystemStatusHistory>>> GetSystemStatusHistories(
        Instant from,
        Instant until
    )
    {
        var rangeHistories = await context
            .SystemStatusHistories.Where(h => h.Timestamp >= from && h.Timestamp <= until)
            .ToListAsync();

        var priorHistory = await context
            .SystemStatusHistories.Where(h => h.Timestamp < from)
            .OrderByDescending(h => h.Timestamp)
            .FirstOrDefaultAsync();

        return priorHistory is null ? rangeHistories : [.. rangeHistories, priorHistory];
    }
}
