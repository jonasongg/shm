using Microsoft.EntityFrameworkCore;
using Shared.Models;

var AllowedSpecificOrigins = "_allowedSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ReportContext>(options => options.UseInMemoryDatabase("ReportDb"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
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

app.MapPost(
    "/report",
    async (Report report, ReportContext context) =>
    {
        context.Reports.Add(report);
        await context.SaveChangesAsync();

        return Results.Created($"/report/{report.Name}", report);
    }
);

app.MapGet(
    "/reports",
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
        return (await context.Reports.ToListAsync())
            .OrderByDescending(r => r.Timestamp)
            .GroupBy(r => r.Name)
            .SelectMany(rs => rs.Take(10));
    }
);

app.Run();
