using System.Text.Json.Serialization;
using SHM_MS.Dtos;

namespace SHM_MS.Interfaces;

public enum EventType
{
    Report,
    VmStatus,
    SystemStatus,
}

[JsonDerivedType(typeof(ReportDto), nameof(EventType.Report))]
[JsonDerivedType(typeof(VmStatusDto), nameof(EventType.VmStatus))]
[JsonDerivedType(typeof(SystemStatusDto), nameof(EventType.SystemStatus))]
public interface IServerEvent
{
    EventType EventType { get; }
}

public interface IChannelService<T> : IChannelServiceReader, IChannelServiceWriter<T>
    where T : IServerEvent;

public interface IChannelServiceReader
{
    Task<IServerEvent> ReadAsync(CancellationToken cancellationToken);
}

public interface IChannelServiceWriter<T>
{
    Task WriteAsync(T toWrite, CancellationToken cancellationToken);
}
