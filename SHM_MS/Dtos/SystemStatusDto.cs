namespace SHM_MS.Dtos;

public enum SystemStatus
{
    Ok,
    KafkaBrokerDown,
}

public record SystemStatusDto
{
    public required SystemStatus Status { get; set; }
}
