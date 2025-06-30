using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Interfaces;
using SHM_MS.Models;

namespace SHM_MS.Services;

public class VmStatusService(
    IDbContextFactory<SHMContext> contextFactory,
    IChannelServiceWriter<VmStatusDto> vmStatusChannelServiceWriter,
    IClock clock
)
{
    private readonly Period TimerInterval = Period.FromSeconds(5);
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

        _ = Task.Run(
            async () =>
            {
                await using var context = await contextFactory.CreateDbContextAsync(newCts.Token);
                try
                {
                    await SetOnlineAsync(context, vmId, newCts.Token);
                    await Task.Delay(TimerInterval.ToDuration().ToTimeSpan(), newCts.Token);
                    await SetOfflineAsync(context, vmId, newCts.Token);
                }
                catch (Exception ex)
                {
                    if (ex is not TaskCanceledException)
                        Console.WriteLine($"Error processing VM {vmId}: {ex.Message}");
                }
            },
            newCts.Token
        );
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

        // we don't save changes first - we want to recalculate status first
        // in case this vm is supposed to be degraded
        await RecalculateStatusesAsync(context, cancellationToken);
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

        await SaveChangesAndPublishStatusAsync(context, cancellationToken);
    }

    public async Task RecalculateStatusesAsync(
        SHMContext context,
        CancellationToken cancellationToken = default
    )
    {
        var vms = await context.Vms.Include(vm => vm.Dependants).ToListAsync(cancellationToken);

        vms.Where(vm => vm.Status == VmStatus.Degraded)
            .ToList()
            .ForEach(vm => vm.Status = VmStatus.Online);
        var dependants = new Queue<Vm>(
            vms.Where(vm => vm.Status == VmStatus.Offline).SelectMany(vm => vm.Dependants)
        );
        while (dependants.Count > 0)
        {
            var dependant = dependants.Dequeue();
            vms.Find(vm => vm.Id == dependant.Id)?.Dependants.ToList().ForEach(dependants.Enqueue);
            if (dependant.Status == VmStatus.Online)
            {
                dependant.Status = VmStatus.Degraded;
            }
        }

        await SaveChangesAndPublishStatusAsync(context, cancellationToken);
    }

    public async Task RecalculateStatusesOnStartupAsync(
        CancellationToken cancellationToken = default
    )
    {
        await using var context = await contextFactory.CreateDbContextAsync(cancellationToken);
        var vms = await context
            .Vms.Include(vm => vm.Reports.OrderByDescending(r => r.Timestamp).Take(1))
            .ToListAsync(cancellationToken);
        foreach (var vm in vms)
        {
            var lastReport = vm.Reports.FirstOrDefault();
            if (lastReport is null || lastReport.Timestamp < clock.GetCurrentInstant())
            {
                vm.Status = VmStatus.Offline;
            }
            else
            {
                vm.Status = VmStatus.Online;
            }
        }

        await RecalculateStatusesAsync(context, cancellationToken);
    }

    private async Task SaveChangesAndPublishStatusAsync(
        SHMContext context,
        CancellationToken cancellationToken
    )
    {
        var statusChanges = context
            .ChangeTracker.Entries<Vm>()
            .Where(e => e.State == EntityState.Modified && e.Property(vm => vm.Status).IsModified)
            .Select(e => new VmStatusDto { Id = e.Entity.Id, Status = e.Entity.Status })
            .ToList();

        foreach (var change in statusChanges)
        {
            await vmStatusChannelServiceWriter.WriteAsync(change, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
