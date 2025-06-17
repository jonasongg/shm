using System.Threading.Channels;
using SHM_MS.Dtos;

namespace SHM_MS.Services;

public class VmStatusChannelService()
{
    private readonly Channel<VmStatusDto> channel = Channel.CreateUnbounded<VmStatusDto>();

    public async Task WriteAsync(VmStatusDto vmStatus, CancellationToken cancellationToken)
    {
        await channel.Writer.WriteAsync(vmStatus, cancellationToken);
    }

    public ValueTask<VmStatusDto> ReadAsync(CancellationToken cancellationToken)
    {
        return channel.Reader.ReadAsync(cancellationToken);
    }
}
