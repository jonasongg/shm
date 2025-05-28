using Microsoft.Extensions.Logging.Configuration;
using Microsoft.Extensions.Logging.EventLog;
using MonitoringService;
using MonitoringService.Services;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "MonitoringService";
});

builder.Services.AddSingleton<ProducerService>();

if (OperatingSystem.IsWindows())
{
    LoggerProviderOptions.RegisterProviderOptions<EventLogSettings, EventLogLoggerProvider>(
        builder.Services
    );
}

builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
