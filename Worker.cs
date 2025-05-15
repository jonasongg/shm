using System.Management;
using System.Net.Http.Json;

namespace MonitoringService;

public class Worker(ILogger<Worker> logger) : BackgroundService
{
    private static readonly HttpClient httpClient = new();
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (!OperatingSystem.IsWindows()) return;

            using (var searcher = new ManagementObjectSearcher("select * from Win32_OperatingSystem"))
            {
                // there's only one
                var obj = searcher.Get().OfType<ManagementObject>().First();

                var totalMemory = Convert.ToDouble(obj["TotalVisibleMemorySize"]);
                var freeMemory = Convert.ToDouble(obj["FreePhysicalMemory"]);
                var memoryUsagePercent = (totalMemory - freeMemory) / totalMemory * 100;

                var info = new { totalMemory, memoryUsagePercent };

                try
                {
                    await httpClient.PostAsJsonAsync("http://localhost:5043", info, stoppingToken);
                }
                catch
                {
                    logger.LogCritical("Couldn't post info");
                }

                if (logger.IsEnabled(LogLevel.Information))
                {
                    logger.LogInformation("Status: {info}", info);
                }
            }
            await Task.Delay(1000, stoppingToken);
        }
    }
}
