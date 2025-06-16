using System.Diagnostics.CodeAnalysis;
using NuGet.Packaging;
using SHM_MS.Models;

namespace SHM_MS.Dtos;

public record VmDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public ICollection<ReportDto> Reports { get; } = [];
    public ICollection<int> DependencyIds { get; } = [];
    public ICollection<int> DependantIds { get; } = [];
    public required VmStatus Status { get; set; }

    [SetsRequiredMembers]
    public VmDto(Vm vm)
    {
        Id = vm.Id;
        Name = vm.Name;
        Reports.AddRange(vm.Reports.Select(r => new ReportDto(r)));
        DependencyIds.AddRange(vm.Dependencies.Select(d => d.Id));
        DependantIds.AddRange(vm.Dependants.Select(d => d.Id));
        Status = vm.Status;
    }
}
