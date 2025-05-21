using Microsoft.EntityFrameworkCore;
using Shared.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ReportDb>(options => options.UseInMemoryDatabase("ReportDb"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();

app.MapPost("/report", async (Report report, ReportDb db) =>
{
    db.Reports.Add(report);
    await db.SaveChangesAsync();

    return Results.Created($"/report/{report.Name}", report);
});

app.MapGet("/reports", async (ReportDb db) =>
    await db.Reports
        .Take(10)
        .ToListAsync()
);

app.Run();
