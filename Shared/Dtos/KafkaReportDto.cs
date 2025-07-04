using NodaTime;

namespace Shared.Dtos;

public class KafkaReportDto
{
    public required Instant Timestamp { get; set; }
    public required string Name { get; set; }
    public required double TotalMemory { get; set; }
    public required double FreeMemory { get; set; }
    public required double CpuUsagePercent { get; set; }
    public required double TotalSpace { get; set; }
    public required double FreeSpace { get; set; }
}
