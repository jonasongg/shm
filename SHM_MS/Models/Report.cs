using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace SHM_MS.Models;

[PrimaryKey(nameof(Timestamp), nameof(VmId))]
public class Report
{
    public required Instant Timestamp { get; set; }
    public required double TotalMemory { get; set; }
    public required double FreeMemory { get; set; }
    public required double CpuUsagePercent { get; set; }
    public required double TotalSpace { get; set; }
    public required double FreeSpace { get; set; }
    public required int VmId { get; set; }
    public Vm Vm { get; set; } = null!;
}
