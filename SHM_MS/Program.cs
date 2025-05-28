using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using SHM_MS.DbContexts;
using SHM_MS.Services;

var AllowedSpecificOrigins = "_allowedSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContextFactory<ReportContext>(options =>
    options.UseInMemoryDatabase("ReportDb")
);
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddSingleton<ConsumerService>();
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
    // async (IDbContextFactory<ReportContext> contextFactory) =>
    async (ReportContext context) =>
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
            .GroupBy(r => r.Name)
            .SelectMany(rs => rs.Take(10));
    }
);

app.MapGet(
    "/reports/stream",
    async (
        HttpContext httpContext,
        [FromServices] ConsumerService consumerService,
        CancellationToken cancel
    ) =>
    {
        httpContext.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");
        while (!cancel.IsCancellationRequested)
        {
            var report = await consumerService.WaitForReportAsync(cancel);

            await httpContext.Response.WriteAsync("data: ", cancel);
            await JsonSerializer.SerializeAsync(
                httpContext.Response.Body,
                report,
                cancellationToken: cancel
            );
            await httpContext.Response.WriteAsync("\n\n", cancel);
            await httpContext.Response.Body.FlushAsync(cancel);

            consumerService.ResetTcs();
        }
    }
);

app.Run();
