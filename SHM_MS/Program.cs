using Shared;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

Report? report = null;

app.MapPost("/report", (Report _report) =>
{
    report = _report;
});

app.MapGet("/", () => report);

app.Run();
