using SHM_MS.Interfaces;
using SHM_MS.Models;

namespace SHM_MS.Dtos;

public record VmStatusDto : IServerEvent
{
    public EventType EventType => EventType.VmStatus;
    public required int Id { get; set; }
    public required VmStatus Status { get; set; }
}
