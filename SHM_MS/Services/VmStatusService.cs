using System.Collections.Concurrent;
using System.Runtime.Versioning;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SHM_MS.DbContexts;
using SHM_MS.Models;

namespace SHM_MS.Services;

public class VmStatusService(IDbContextFactory<SHMContext> contextFactory)
{
    const int TimerInterval = 5000;
    private readonly ConcurrentDictionary<int, CancellationTokenSource> timers = new();

    public void NotifyReportReceived(int vmId)
    {
        if (timers.TryGetValue(vmId, out var cts))
        {
            cts.Cancel();
            cts.Dispose();
        }

        var newCts = new CancellationTokenSource();
        timers[vmId] = newCts;

        _ = Task.Run(async () =>
        {
            await using var context = await contextFactory.CreateDbContextAsync(newCts.Token);
            try
            {
                await SetOnlineAsync(context, vmId, newCts.Token);
                await Task.Delay(TimerInterval, newCts.Token);
                await SetOfflineAsync(context, vmId, newCts.Token);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing VM {vmId}: {ex.Message}");
            }
        });
    }

    private async Task SetOfflineAsync(
        SHMContext context,
        int vmId,
        CancellationToken cancellationToken
    )
    {
        var vm = await context
            .Vms.Include(vm => vm.Dependants)
            .FirstOrDefaultAsync(vm => vm.Id == vmId, cancellationToken);
        if (vm is null)
        {
            return;
        }

        vm.Status = VmStatus.Offline;

        var dependants = new Queue<Vm>(vm.Dependants);
        while (dependants.Count > 0)
        {
            var dependant = dependants.Dequeue();
            dependant.Dependants.ToList().ForEach(dependants.Enqueue);
            if (dependant.Status == VmStatus.Online)
            {
                dependant.Status = VmStatus.Degraded;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task SetOnlineAsync(
        SHMContext context,
        int vmId,
        CancellationToken cancellationToken
    )
    {
        var vm = await context.Vms.FirstOrDefaultAsync(vm => vm.Id == vmId, cancellationToken);
        if (vm is null)
        {
            return;
        }

        vm.Status = VmStatus.Online;
        await context.SaveChangesAsync(cancellationToken);

        await RecalculateStatusesAsync(context, cancellationToken);
    }

    public async Task RecalculateStatusesAsync(
        SHMContext context,
        CancellationToken cancellationToken = default
    )
    {
        foreach (var v in context.Vms.Where(vm => vm.Status == VmStatus.Degraded))
        {
            v.Status = VmStatus.Online;
        }

        var dependants = new Queue<Vm>(
            context
                .Vms.Include(vm => vm.Dependants)
                .Where(vm => vm.Status == VmStatus.Offline)
                .SelectMany(vm => vm.Dependants)
        );
        while (dependants.Count > 0)
        {
            var dependant = dependants.Dequeue();
            dependant.Dependants.ToList().ForEach(dependants.Enqueue);
            if (dependant.Status == VmStatus.Online)
            {
                dependant.Status = VmStatus.Degraded;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
