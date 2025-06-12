using System.Diagnostics.CodeAnalysis;
using NodaTime;
using SHM_MS.Models;

namespace SHM_MS.Dtos;

[method: SetsRequiredMembers]
public record ReportDto(Report R)
{
    public required LocalDateTime Timestamp = R.Timestamp;
    public required double TotalMemory = R.TotalMemory;
    public required double FreeMemory = R.FreeMemory;
    public required double CpuUsagePercent = R.CpuUsagePercent;
    public required double TotalSpace = R.TotalSpace;
    public required double FreeSpace = R.FreeSpace;
    public required int VmId = R.VmId;
}
