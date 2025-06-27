using System.Threading.Channels;
using SHM_MS.Dtos;
using SHM_MS.Interfaces;

namespace SHM_MS.Services;

public class ReportChannelService() : IChannelService<ReportDto>
{
    private readonly Channel<ReportDto> channel = Channel.CreateUnbounded<ReportDto>();

    public async Task WriteAsync(ReportDto report, CancellationToken cancellationToken) =>
        await channel.Writer.WriteAsync(report, cancellationToken);

    public async Task<IServerEvent> ReadAsync(CancellationToken cancellationToken) =>
        await channel.Reader.ReadAsync(cancellationToken);
}
