using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using SHM_MS.DbContexts;
using SHM_MS.Services;

var AllowedSpecificOrigins = "_allowedSpecificOrigins";
var JsonSerializerOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
};

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContextFactory<SHMContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Postgres"))
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddSingleton<ReportChannelService>();
builder.Services.AddHostedService<ConsumerService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        AllowedSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:3000");
        }
    );
});
var app = builder.Build();

app.UseCors(AllowedSpecificOrigins);

app.MapGet(
    "/reports",
    async (SHMContext context) =>
    {
        // await context
        //     .Reports.FromSqlRaw(
        //         @"
        //         SELECT *
        //         FROM (
        //             SELECT *, ROW_NUMBER() OVER (PARTITION BY Name ORDER BY Timestamp DESC) AS rn
        //             FROM Reports
        //         ) AS ranked
        //         WHERE rn <= 10"
        //     )
        //     .ToListAsync()
        // using var context = contextFactory.CreateDbContext();

        return (await context.Reports.ToListAsync())
            .OrderByDescending(r => r.Timestamp)
            .GroupBy(r => r.Vm)
            .SelectMany(rs => rs.Take(10));
    }
);

app.MapGet(
    "/reports/stream",
    async (
        HttpContext httpContext,
        [FromServices] ReportChannelService reportChannelService,
        CancellationToken cancellationToken
    ) =>
    {
        httpContext.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");
        while (!cancellationToken.IsCancellationRequested)
        {
            var report = await reportChannelService.ReadAsync(cancellationToken);

            await httpContext.Response.WriteAsync("data: ", cancellationToken);
            await JsonSerializer.SerializeAsync(
                httpContext.Response.Body,
                report,
                options: JsonSerializerOptions,
                cancellationToken: cancellationToken
            );
            await httpContext.Response.WriteAsync("\n\n", cancellationToken);
            await httpContext.Response.Body.FlushAsync(cancellationToken);
        }
    }
);

app.Run();
