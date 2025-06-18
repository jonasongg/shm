using SHM_MS.Interfaces;

namespace SHM_MS.Dtos;

public enum SystemStatus
{
    Ok,
    KafkaBrokerDown,
}

public record SystemStatusDto : IServerEvent
{
    public EventType EventType => EventType.SystemStatus;
    public required SystemStatus Status { get; set; }
}
