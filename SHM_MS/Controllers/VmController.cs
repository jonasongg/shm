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
            options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

            while (!cancellationToken.IsCancellationRequested)
            {
                await HttpContext.Response.WriteAsync("data: ", cancellationToken);
                await JsonSerializer.SerializeAsync(
                    HttpContext.Response.Body,
                    GetVmsWithStatusAsync(),
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
            return await context
                .Reports.FromSql(
                    $"SELECT DISTINCT ON (vm_id) * FROM reports ORDER BY vm_id, timestamp desc"
                )
                .Select(r => new VmDto
                {
                    Id = r.VmId,
                    Name = r.Vm.Name,
                    VmStatus =
                        r.Timestamp
                        < clock
                            .GetCurrentInstant()
                            .InZone(DateTimeZoneProviders.Tzdb.GetSystemDefault())
                            .LocalDateTime.Minus(Period.FromSeconds(5))
                            ? VmStatus.Offline
                            : VmStatus.Online,
                })
                .ToListAsync();
        }
    }
}
