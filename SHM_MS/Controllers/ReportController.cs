using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using NodaTime.Serialization.SystemTextJson;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Models;
using SHM_MS.Services;

namespace SHM_MS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController(ReportChannelService reportChannelService) : ControllerBase
    {
        // GET: api/report/stream
        [HttpGet("stream")]
        public async Task GetReportStream(CancellationToken cancellationToken)
        {
            HttpContext.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            options.Converters.Add(NodaConverters.LocalDateTimeConverter);

            while (!cancellationToken.IsCancellationRequested)
            {
                var report = await reportChannelService.ReadAsync(cancellationToken);

                await HttpContext.Response.WriteAsync("data: ", cancellationToken);
                await JsonSerializer.SerializeAsync(
                    HttpContext.Response.Body,
                    new ReportDto(report),
                    options: options,
                    cancellationToken: cancellationToken
                );
                await HttpContext.Response.WriteAsync("\n\n", cancellationToken);
                await HttpContext.Response.Body.FlushAsync(cancellationToken);
            }
        }
    }
}
