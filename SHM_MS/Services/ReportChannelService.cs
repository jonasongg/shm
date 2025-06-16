using System.Threading.Channels;
using Microsoft.EntityFrameworkCore;
using SHM_MS.DbContexts;
using SHM_MS.Models;

namespace SHM_MS.Services;

public class ReportChannelService(IDbContextFactory<SHMContext> contextFactory)
{
    private readonly Channel<Report> channel = Channel.CreateUnbounded<Report>();

    public async Task WriteAsync(Report report, CancellationToken cancellationToken)
    {
        await using var context = await contextFactory.CreateDbContextAsync(cancellationToken);
        var vm = await context
            .Vms.Include(vm => vm.Dependants)
            .FirstOrDefaultAsync(vm => vm.Id == report.VmId, cancellationToken);

        if (vm is not null && vm.Status == VmStatus.Online)
        {
            await channel.Writer.WriteAsync(report, cancellationToken);
        }
    }

    public ValueTask<Report> ReadAsync(CancellationToken cancellationToken)
    {
        return channel.Reader.ReadAsync(cancellationToken);
    }
}
