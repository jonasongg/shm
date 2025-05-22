using Microsoft.EntityFrameworkCore;
using Shared.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ReportContext>(options => options.UseInMemoryDatabase("ReportDb"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();

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
        await context.Reports.OrderByDescending(r => r.Timestamp).Take(10).ToListAsync()
);

app.Run();
