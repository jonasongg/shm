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
            if (!OperatingSystem.IsWindows())
            {
                logger.LogCritical("This service only works on Windows");
                throw new PlatformNotSupportedException("This service only works on Windows");
            }

            using (var memSearcher = new ManagementObjectSearcher("select * from Win32_OperatingSystem"))
            using (var cpuSearcher = new ManagementObjectSearcher("select * from Win32_Processor"))
            {
                // there's only one
                var memObj = memSearcher.Get().OfType<ManagementObject>().First();
                var cpuObj = cpuSearcher.Get().OfType<ManagementObject>().First();

                var totalMemory = Convert.ToDouble(memObj["TotalVisibleMemorySize"]);
                var freeMemory = Convert.ToDouble(memObj["FreePhysicalMemory"]);
                var memoryUsagePercent = (totalMemory - freeMemory) / totalMemory * 100;
                var cpuUsagePercent = Convert.ToDouble(cpuObj["LoadPercentage"]);

                var info = new Report(totalMemory, memoryUsagePercent, cpuUsagePercent);

                try
                {
                    await httpClient.PostAsJsonAsync("http://localhost:5043/report", info, stoppingToken);
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
            await Task.Delay(5000, stoppingToken);
        }
    }
}

record Report(double TotalMemory, double MemoryUsagePercent, double CpuUsagePercent);
