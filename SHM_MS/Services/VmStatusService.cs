using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using SHM_MS.DbContexts;

namespace SHM_MS.Services;

public class VmStatusService(SHMContext context)
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

        Task.Run(
            async () =>
            {
                try
                {
                    await Task.Delay(TimerInterval, newCts.Token);

                    await context.Vms.FirstOrDefaultAsync(vm => vm.Id == vmId);
                }
                catch (TaskCanceledException)
                {
                    // the task was cancelled by the receipt of a new report, so do nothing
                }
            },
            newCts.Token
        );
    }
}
