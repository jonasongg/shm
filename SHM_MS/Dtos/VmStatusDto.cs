using SHM_MS.Models;

namespace SHM_MS.Dtos;

public record VmStatusDto
{
    public required int Id { get; set; }
    public required VmStatus Status { get; set; }
}
