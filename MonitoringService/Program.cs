using Microsoft.Extensions.Logging.Configuration;
using Microsoft.Extensions.Logging.EventLog;
using MonitoringService;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "MonitoringService";
});
builder.Services.AddHttpClient();

if (OperatingSystem.IsWindows())
{
    LoggerProviderOptions.RegisterProviderOptions<EventLogSettings, EventLogLoggerProvider>(
        builder.Services
    );
}

builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
