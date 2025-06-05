using System.Diagnostics;
using System.Management;
using System.Runtime.Versioning;
using Confluent.Kafka;
using MonitoringService.Services;
using NodaTime;
using Shared.DTOs;

namespace MonitoringService;

public class Worker(
    IConfiguration configuration,
    ILogger<Worker> logger,
    ProducerService producerService,
    IClock clock
) : BackgroundService
{
    private long lastCpuIdleTime = 0;
    private long lastCpuTotalTime = 0;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var name = configuration["VM_Name"] ?? "";

        while (!stoppingToken.IsCancellationRequested)
        {
            var info =
                OperatingSystem.IsWindows() ? GetWindowsInfo(name)
                : OperatingSystem.IsLinux() ? GetLinuxInfo(name)
                : throw new PlatformNotSupportedException();

            try
            {
                var result = await producerService.ProduceAsync(name, info, stoppingToken);
                logger.LogInformation(
                    "Produced successfully: {info} at {time}",
                    info,
                    result.Timestamp.UtcDateTime
                );
            }
            catch (ProduceException<string, ReportDTO> e)
            {
                logger.LogCritical("Couldn't produce info! {e}", e);
            }

            await Task.Delay(1000, stoppingToken);
        }
    }

    [SupportedOSPlatform("windows")]
    private ReportDTO GetWindowsInfo(string name)
    {
        using ManagementObjectSearcher memSearcher = new("select * from Win32_OperatingSystem");
        var memObj = memSearcher.Get().OfType<ManagementObject>().First(); // there's only one
        var totalMemory = Convert.ToDouble(memObj["TotalVisibleMemorySize"]);
        var freeMemory = Convert.ToDouble(memObj["FreePhysicalMemory"]);

        using ManagementObjectSearcher cpuSearcher = new("select * from Win32_Processor");
        var cpuObj = cpuSearcher.Get().OfType<ManagementObject>().First();
        var cpuUsagePercent = Convert.ToDouble(cpuObj["LoadPercentage"]);

        var (totalSpace, freeSpace) = DiskInfo();

        return new ReportDTO
        {
            Name = name,
            Timestamp = GetLocalDateTime(),
            TotalMemory = totalMemory,
            FreeMemory = freeMemory,
            CpuUsagePercent = cpuUsagePercent,
            TotalSpace = totalSpace,
            FreeSpace = freeSpace,
        };
    }

    [SupportedOSPlatform("linux")]
    private ReportDTO GetLinuxInfo(string name)
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

        var cpuUsagePercent =
            (1 - (float)(idleTime - lastCpuIdleTime) / (totalTime - lastCpuTotalTime)) * 100;

        lastCpuIdleTime = idleTime;
        lastCpuTotalTime = totalTime;

        var (totalSpace, freeSpace) = DiskInfo();

        return new ReportDTO
        {
            Name = name,
            Timestamp = GetLocalDateTime(),
            TotalMemory = Convert.ToDouble(totalMemory),
            FreeMemory = Convert.ToDouble(freeMemory),
            CpuUsagePercent = cpuUsagePercent,
            TotalSpace = totalSpace,
            FreeSpace = freeSpace,
        };
    }

    private static string ReadProcFile(string path)
    {
        var info = new ProcessStartInfo
        {
            FileName = "/bin/bash",
            Arguments = $"-c \"cat {path}\"",
            RedirectStandardOutput = true,
        };

        using var process = Process.Start(info);
        return process?.StandardOutput.ReadToEnd() ?? throw new Exception($"Couldn't read {path}.");
    }

    private static (double totalSpace, double freeSpace) DiskInfo()
    {
        DriveInfo[] allDrives = DriveInfo.GetDrives();

        var totalSpace =
            allDrives.Where(d => d.DriveType is DriveType.Fixed).Select(d => d.TotalSize).Sum()
            / 1024d;
        var freeSpace =
            allDrives.Where(d => d.DriveType is DriveType.Fixed).Select(d => d.TotalFreeSpace).Sum()
            / 1024d;

        return (totalSpace, freeSpace);
    }

    private LocalDateTime GetLocalDateTime()
    {
        return clock
            .GetCurrentInstant()
            .InZone(DateTimeZoneProviders.Tzdb.GetSystemDefault())
            .LocalDateTime;
    }
}
