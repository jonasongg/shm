using System.Threading.Channels;
using SHM_MS.Dtos;

namespace SHM_MS.Services;

public class SystemStatusChannelService()
{
    private readonly Channel<SystemStatusDto> channel = Channel.CreateUnbounded<SystemStatusDto>();

    public async Task WriteAsync(SystemStatusDto vmStatus, CancellationToken cancellationToken)
    {
        await channel.Writer.WriteAsync(vmStatus, cancellationToken);
    }

    public ValueTask<SystemStatusDto> ReadAsync(CancellationToken cancellationToken)
    {
        return channel.Reader.ReadAsync(cancellationToken);
    }
}
