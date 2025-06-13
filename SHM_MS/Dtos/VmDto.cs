using NuGet.Packaging;
using SHM_MS.Models;

namespace SHM_MS.Dtos;

public enum VmStatus
{
    Offline,
    Online,
    Degraded,
}

public record VmDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public ICollection<ReportDto> Reports { get; } = [];
    public ICollection<int> DependencyIds { get; } = [];
    public ICollection<int> DependantIds { get; } = [];
    public required VmStatus Status { get; set; }

    public VmDto(Vm vm)
    {
        Reports.AddRange(vm.Reports.Select(r => new ReportDto(r)));
        DependencyIds.AddRange(vm.Dependencies.Select(d => d.Id));
        DependantIds.AddRange(vm.Dependants.Select(d => d.Id));
    }
}
