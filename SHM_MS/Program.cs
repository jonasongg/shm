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
        await context.Reports.OrderByDescending(r => r.Timestamp).Take(10).ToListAsync()
);

app.Run();
