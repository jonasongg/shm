using SHM_MS.Models;

namespace SHM_MS.Dtos;

public record VmStatusHistoriesResponseDto
{
    public required int VmId { get; set; }
    public required IEnumerable<VmStatusHistory> Histories { get; set; }
}
