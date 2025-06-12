using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Models;

namespace SHM_MS.Controllers
{
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

        // PUT: api/vm/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVm(int id, Vm vm)
        {
            if (id != vm.Id)
            {
                return BadRequest();
            }

            context.Entry(vm).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!context.Vms.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
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

            return CreatedAtAction("GetVm", new { id = vm.Id }, vm);
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

        private async Task<IEnumerable<VmDto>> GetVmsWithStatusAsync()
        {
            var statusMap = new Dictionary<Vm, VmStatus>();
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
                    statusMap[r.Vm] = vmStatus;
                });

            var offlineDependants = statusMap
                .Where(kvp => kvp.Value == VmStatus.Offline)
                .SelectMany(kvp => kvp.Key.Dependants);

            Queue<Vm> dependants = new(offlineDependants);
            while (dependants.Count != 0)
            {
                var dependant = dependants.Dequeue();

                // Assume that we can find this VM from the query above, which should be the case.
                // Here, status is either Online or Offline.
                // If it's Offline, set all Dependants to Degraded if they're Online.
                if (statusMap[dependant] == VmStatus.Online)
                {
                    statusMap[dependant] = VmStatus.Degraded;
                }
                foreach (var grandDependants in dependant.Dependants)
                {
                    dependants.Enqueue(grandDependants);
                }
            }
            return (await context.Vms.ToListAsync()).Select(vm => new VmDto
            {
                Id = vm.Id,
                Name = vm.Name,
                Status = statusMap[vm],
            });
        }
    }
}
