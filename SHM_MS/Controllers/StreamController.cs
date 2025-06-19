using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using NodaTime.Serialization.SystemTextJson;
using SHM_MS.Interfaces;
using SHM_MS.Services;

namespace SHM_MS.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StreamController(IEnumerable<IChannelServiceReader> channelServiceReaders)
    : ControllerBase
{
    // GET: api/stream
    [HttpGet]
    public async Task GetStream(CancellationToken cancellationToken)
    {
        HttpContext.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };
        options.Converters.Add(NodaConverters.InstantConverter);
        options.Converters.Add(new JsonStringEnumConverter());

        var readTasks = channelServiceReaders
            .Select(reader => reader.ReadAsync(cancellationToken))
            .ToList();

        while (!cancellationToken.IsCancellationRequested)
        {
            var completedTask = await Task.WhenAny(readTasks);
            var serverEvent = await completedTask;
            var eventType = serverEvent.EventType;

            await HttpContext.Response.WriteAsync($"event: {eventType}\ndata: ", cancellationToken);
            await JsonSerializer.SerializeAsync(
                HttpContext.Response.Body,
                serverEvent,
                options,
                cancellationToken
            );
            await HttpContext.Response.WriteAsync("\n\n", cancellationToken);
            await HttpContext.Response.Body.FlushAsync(cancellationToken);

            int completedIndex = readTasks.IndexOf(completedTask);
            readTasks[completedIndex] = channelServiceReaders
                .ElementAt(completedIndex)
                .ReadAsync(cancellationToken);
        }
    }
}
