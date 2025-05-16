using System.Diagnostics;
using System.Management;
using System.Net.Http.Json;
using System.Runtime.Versioning;
using System.Threading.Tasks;

namespace MonitoringService;

public class Worker(ILogger<Worker> logger) : BackgroundService
{
    private long lastCpuIdleTime = 0;
    private long lastCpuTotalTime = 0;

    private static readonly HttpClient httpClient = new();
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var info = OperatingSystem.IsWindows()
                ? GetWindowsInfo()
                : OperatingSystem.IsLinux()
                ? GetLinuxInfo()
                : throw new PlatformNotSupportedException();

            logger.LogInformation("Status: {info}", info);

            try
            {
                await httpClient.PostAsJsonAsync("http://localhost:5043/report", info, stoppingToken);
            }
            catch
            {
                logger.LogCritical("Couldn't post info");
            }

            logger.LogInformation("Status: {info}", info);
        }
        await Task.Delay(5000, stoppingToken);
    }

    [SupportedOSPlatform("windows")]
    private Report GetWindowsInfo()
    {
        using ManagementObjectSearcher memSearcher = new("select * from Win32_OperatingSystem");
        using ManagementObjectSearcher cpuSearcher = new("select * from Win32_Processor");

        // there's only one
        var memObj = memSearcher.Get().OfType<ManagementObject>().First();
        var cpuObj = cpuSearcher.Get().OfType<ManagementObject>().First();

        var totalMemory = Convert.ToDouble(memObj["TotalVisibleMemorySize"]);
        var freeMemory = Convert.ToDouble(memObj["FreePhysicalMemory"]);
        var memoryUsagePercent = (totalMemory - freeMemory) / totalMemory * 100;
        var cpuUsagePercent = Convert.ToDouble(cpuObj["LoadPercentage"]);

        return new Report(totalMemory, memoryUsagePercent, cpuUsagePercent);
    }

    [SupportedOSPlatform("linux")]
    private Report GetLinuxInfo()
    {
        var memoryInfo = ReadProcFile("/proc/meminfo");

        var totalMemory = memoryInfo.Split("MemTotal:")[1].Trim().Split(' ')[0].Trim();
        var freeMemory = memoryInfo.Split("MemFree:")[1].Trim().Split(' ')[0].Trim();

        // get CPU usage by reading /proc/stat (which has info about usage since boot),
        // then calculating CPU load since the last time it has been updated.
        // format: cpu  10132153 290696 3084719 46828483 16683 0 25195 0 175628
        var cpuLine = ReadProcFile("/proc/stat").Split("\n")[0].Trim();
        var cpuNumbers = cpuLine.Split("cpu")[1].Trim().Split(' ').Select(long.Parse).ToArray();

        var idleTime = cpuNumbers[3];
        var totalTime = cpuNumbers.Sum();

        var currentCpuUsage = (1 - (float)(idleTime - lastCpuIdleTime) / (totalTime - lastCpuTotalTime)) * 100;

        lastCpuIdleTime = idleTime;
        lastCpuTotalTime = totalTime;

        return new Report(Convert.ToDouble(totalMemory), Convert.ToDouble(freeMemory), currentCpuUsage);
    }

    private string ReadProcFile(string path)
    {
        var info = new ProcessStartInfo
        {
            FileName = "/bin/bash",
            Arguments = $"-c \"cat {path}\"",
            RedirectStandardOutput = true
        };

        using var process = Process.Start(info);
        return process?.StandardOutput.ReadToEnd() ?? throw new Exception($"Couldn't read {path}.");
    }
}

record Report(double TotalMemory, double MemoryUsagePercent, double CpuUsagePercent);
