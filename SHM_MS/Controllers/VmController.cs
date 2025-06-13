using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using NuGet.Packaging;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Models;

namespace SHM_MS.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VmController(SHMContext context, IClock clock) : ControllerBase
{
    // GET: api/vm
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VmDto>>> GetVms()
    {
        return (await GetVmsWithStatusAsync()).ToList();
    }

    // POST: api/vm
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Vm>> PostVm(Vm vm)
    {
        if (await context.Vms.AnyAsync(v => v.Name == vm.Name))
        {
            return Conflict("A VM with this name already exists.");
        }
        if (vm.Name == null || vm.Name.Trim() == "")
        {
            return BadRequest("VM name cannot be empty.");
        }

        context.Vms.Add(vm);
        await context.SaveChangesAsync();

        return Created();
    }

    // DELETE: api/vm/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVm(int id)
    {
        var vm = await context.Vms.FindAsync(id);
        if (vm == null)
        {
            return NotFound();
        }

        context.Vms.Remove(vm);
        await context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/vm/5/reports
    [HttpDelete("{id}/reports")]
    public async Task<IActionResult> DeleteVmReports(int id)
    {
        var vm = await context.Vms.FindAsync(id);
        if (vm == null)
        {
            return NotFound();
        }

        vm.Reports.Clear();
        await context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/vm/status
    [HttpGet("status")]
    public async Task GetReportStream(CancellationToken cancellationToken)
    {
        HttpContext.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };
        options.Converters.Add(NodaConverters.LocalDateTimeConverter);
        options.Converters.Add(new JsonStringEnumConverter());

        while (!cancellationToken.IsCancellationRequested)
        {
            await HttpContext.Response.WriteAsync("data: ", cancellationToken);
            await JsonSerializer.SerializeAsync(
                HttpContext.Response.Body,
                await GetVmsWithStatusAsync(),
                options: options,
                cancellationToken: cancellationToken
            );
            await HttpContext.Response.WriteAsync("\n\n", cancellationToken);
            await HttpContext.Response.Body.FlushAsync(cancellationToken);

            await Task.Delay(5000, cancellationToken);
        }
    }

    // PUT: api/vm/dependencies
    [HttpPut("dependencies")]
    public async Task<IActionResult> PutDependencies(
        Dictionary<int, ICollection<int>> newDependencies
    )
    {
        var vms = await context.Vms.Include(vm => vm.Dependants).ToDictionaryAsync(vm => vm.Id);

        foreach (var kvp in newDependencies)
        {
            if (!vms.ContainsKey(kvp.Key) || kvp.Value.Any(dep => !vms.ContainsKey(dep)))
            {
                return BadRequest("Unknown VM id in the dependencies!");
            }
        }

        var visited = new Dictionary<int, bool>(
            vms.Select(kvp => new KeyValuePair<int, bool>(kvp.Key, false))
        );
        var recursionList = new Dictionary<int, bool>(visited);

        bool IsCyclic(int current)
        {
            if (recursionList[current])
                return true; // already visited in this path, so return true

            if (visited[current])
                return false; // already visited via another path, so no cycle

            visited[current] = recursionList[current] = true;

            if (newDependencies.TryGetValue(current, out var dep) && dep.Any(d => IsCyclic(d)))
                return true;

            recursionList[current] = false;
            return false;
        }

        foreach (var kvp in visited)
        {
            if (!kvp.Value && IsCyclic(kvp.Key))
            {
                return BadRequest("There is a cycle in the VM dependencies!");
            }
        }

        foreach (var kvp in vms)
        {
            kvp.Value.Dependants.Clear();
        }
        foreach (var kvp in newDependencies)
        {
            vms[kvp.Key].Dependants.AddRange(kvp.Value.Select(id => vms[id]));
        }

        await context.SaveChangesAsync();
        return Ok();
    }

    private async Task<IEnumerable<VmDto>> GetVmsWithStatusAsync()
    {
        var statusMap = new Dictionary<int, VmStatus>();
        await context
            .Reports.FromSql(
                $"SELECT DISTINCT ON (vm_id) * FROM reports ORDER BY vm_id, timestamp desc"
            )
            .ForEachAsync(r =>
            {
                var vmStatus =
                    r.Timestamp
                    < clock
                        .GetCurrentInstant()
                        .InZone(DateTimeZoneProviders.Tzdb.GetSystemDefault())
                        .LocalDateTime.Minus(Period.FromSeconds(5))
                        ? VmStatus.Offline
                        : VmStatus.Online;
                statusMap.Add(r.VmId, vmStatus);
            });

        var vms = (
            await context
                .Vms.Include(vm => vm.Reports.OrderByDescending(r => r.Timestamp).Take(10))
                .Include(vm => vm.Dependants)
                .Include(vm => vm.Dependencies)
                .ToListAsync()
        )
            .Select(vm => new VmDto(vm)
            {
                Id = vm.Id,
                Name = vm.Name,
                Status = statusMap.TryGetValue(vm.Id, out var status) ? status : VmStatus.Offline,
            })
            .ToList();

        var offlineDependants = vms.Where(vm => vm.Status == VmStatus.Offline)
            .SelectMany(vm => vm.DependantIds);

        Queue<int> dependantIds = new(offlineDependants);
        while (dependantIds.Count != 0)
        {
            var dependantId = dependantIds.Dequeue();

            // Assume that we can find this VM from the query above, which should be the case.
            // Here, status is either Online or Offline.
            // If it's Offline, set all Dependants to Degraded if they're Online.
            if (statusMap.TryGetValue(dependantId, out var status) && status == VmStatus.Online)
            {
                var d = vms.FirstOrDefault(vm => vm.Id == dependantId);
                if (d is not null)
                {
                    d.Status = VmStatus.Degraded;
                }
            }
            var grandDependants = vms.FirstOrDefault(vm => vm.Id == dependantId)?.DependantIds;
            if (grandDependants is not null)
            {
                foreach (var grandDependant in grandDependants)
                {
                    dependantIds.Enqueue(grandDependant);
                }
            }
        }
        return vms;
    }
}
