using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SHM_MS.Models;

[PrimaryKey(nameof(Timestamp), nameof(VMId))]
public class Report
{
    public required DateTimeOffset Timestamp { get; set; }
    public required double TotalMemory { get; set; }
    public required double FreeMemory { get; set; }
    public required double CpuUsagePercent { get; set; }
    public required double TotalSpace { get; set; }
    public required double FreeSpace { get; set; }
    public int VMId { get; set; }
    public required VM VM { get; set; } = null!;
}
