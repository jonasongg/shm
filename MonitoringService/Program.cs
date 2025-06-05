using Microsoft.Extensions.Logging.Configuration;
using Microsoft.Extensions.Logging.EventLog;
using MonitoringService;
using MonitoringService.Services;
using NodaTime;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "MonitoringService";
});

builder.Services.AddSingleton<ProducerService>();
builder.Services.AddSingleton<IClock>(SystemClock.Instance);

if (OperatingSystem.IsWindows())
{
    LoggerProviderOptions.RegisterProviderOptions<EventLogSettings, EventLogLoggerProvider>(
        builder.Services
    );
}

builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
