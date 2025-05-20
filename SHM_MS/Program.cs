using SHM_MS.Models;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

Report report = new(0, 0, 0, 0, 0);

app.MapPost("/report", (Report _report) =>
{
    report = _report;
});

app.MapGet("/", () => report);

app.Run();
