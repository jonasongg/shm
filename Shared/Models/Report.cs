namespace Shared.Models;

public class Report
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public double TotalMemory { get; set; }
    public double FreeMemory { get; set; }
    public double CpuUsagePercent { get; set; }
    public double TotalSpace { get; set; }
    public double FreeSpace { get; set; }
}
