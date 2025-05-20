namespace Shared;

public record Report(string Name,
    double TotalMemory, double FreeMemory,
    double CpuUsagePercent,
    double TotalSpace, double FreeSpace
);
