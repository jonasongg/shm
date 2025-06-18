using System.Threading.Channels;
using Microsoft.EntityFrameworkCore;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Interfaces;
using SHM_MS.Models;

namespace SHM_MS.Services;

public class ReportChannelService(IDbContextFactory<SHMContext> contextFactory)
    : IChannelService<ReportDto>
{
    private readonly Channel<ReportDto> channel = Channel.CreateUnbounded<ReportDto>();

    public async Task WriteAsync(ReportDto report, CancellationToken cancellationToken)
    {
        await using var context = await contextFactory.CreateDbContextAsync(cancellationToken);
        var status = (
            await context.Vms.FirstOrDefaultAsync(vm => vm.Id == report.VmId, cancellationToken)
        )?.Status;

        if (status == VmStatus.Online)
        {
            await channel.Writer.WriteAsync(report, cancellationToken);
        }
    }

    public async Task<IServerEvent> ReadAsync(CancellationToken cancellationToken) =>
        await channel.Reader.ReadAsync(cancellationToken);
}
