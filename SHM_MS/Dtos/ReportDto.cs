using System.Diagnostics.CodeAnalysis;
using NodaTime;
using SHM_MS.Interfaces;
using SHM_MS.Models;

namespace SHM_MS.Dtos;

[method: SetsRequiredMembers]
public class ReportDto(Report r) : IServerEvent
{
    public EventType EventType => EventType.Report;
    public required Instant Timestamp { get; set; } = r.Timestamp;
    public required double TotalMemory { get; set; } = r.TotalMemory;
    public required double FreeMemory { get; set; } = r.FreeMemory;
    public required double CpuUsagePercent { get; set; } = r.CpuUsagePercent;
    public required double TotalSpace { get; set; } = r.TotalSpace;
    public required double FreeSpace { get; set; } = r.FreeSpace;
    public required int VmId { get; set; } = r.VmId;
}
