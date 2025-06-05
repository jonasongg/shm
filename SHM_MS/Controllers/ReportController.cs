using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using SHM_MS.DbContexts;
using SHM_MS.Models;
using SHM_MS.Services;

namespace SHM_MS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController(SHMContext context, ReportChannelService reportChannelService)
        : ControllerBase
    {
        // GET: api/report/vm_id
        [HttpGet("{vm_id}")]
        public async Task<ActionResult<IEnumerable<Report>>> GetReports(int vm_id)
        {
            return (
                await context
                    .Reports.Where(r => r.VmId == vm_id)
                    .OrderByDescending(r => r.Timestamp)
                    .Take(10)
                    .ToListAsync()
            );
        }

        // GET: api/report/stream
        [HttpGet("stream")]
        public async Task GetReportStream(CancellationToken cancellationToken)
        {
            HttpContext.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            while (!cancellationToken.IsCancellationRequested)
            {
                var report = await reportChannelService.ReadAsync(cancellationToken);

                await HttpContext.Response.WriteAsync("data: ", cancellationToken);
                await JsonSerializer.SerializeAsync(
                    HttpContext.Response.Body,
                    report,
                    options: options,
                    cancellationToken: cancellationToken
                );
                await HttpContext.Response.WriteAsync("\n\n", cancellationToken);
                await HttpContext.Response.Body.FlushAsync(cancellationToken);
            }
        }
    }
}
