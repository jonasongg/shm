using System.Threading.Channels;
using SHM_MS.Dtos;
using SHM_MS.Interfaces;

namespace SHM_MS.Services;

public class VmStatusChannelService() : IChannelService<VmStatusDto>
{
    private readonly Channel<VmStatusDto> channel = Channel.CreateUnbounded<VmStatusDto>();

    public async Task WriteAsync(VmStatusDto vmStatus, CancellationToken cancellationToken) =>
        await channel.Writer.WriteAsync(vmStatus, cancellationToken);

    public async Task<IServerEvent> ReadAsync(CancellationToken cancellationToken) =>
        await channel.Reader.ReadAsync(cancellationToken);
}
