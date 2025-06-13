namespace SHM_MS.Models;

public enum VmStatus
{
    Offline,
    Online,
    Degraded,
}

public class Vm
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public ICollection<Report> Reports { get; } = [];
    public ICollection<Vm> Dependencies { get; } = [];
    public ICollection<Vm> Dependants { get; } = [];
    public required VmStatus Status { get; set; }
}
