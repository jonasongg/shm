using System.Threading.Channels;
using SHM_MS.Dtos;
using SHM_MS.Interfaces;

namespace SHM_MS.Services;

public class SystemStatusChannelService() : IChannelService<SystemStatusDto>
{
    private readonly Channel<SystemStatusDto> channel = Channel.CreateUnbounded<SystemStatusDto>();

    public async Task WriteAsync(SystemStatusDto vmStatus, CancellationToken cancellationToken) =>
        await channel.Writer.WriteAsync(vmStatus, cancellationToken);

    public async Task<IServerEvent> ReadAsync(CancellationToken cancellationToken) =>
        await channel.Reader.ReadAsync(cancellationToken);
}
