using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Packaging;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Models;
using SHM_MS.Services;

namespace SHM_MS.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VmController(
    SHMContext context,
    VmStatusService vmStatusService,
    IConfiguration configuration
) : ControllerBase
{
    private readonly DockerClient client = new DockerClientConfiguration().CreateClient();

    // GET: api/vm
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VmDto>>> GetVms()
    {
        return await context
            .Vms.Include(vm => vm.Reports.OrderByDescending(r => r.Timestamp).Take(10))
            .Include(vm => vm.Dependants)
            .Include(vm => vm.Dependencies)
            .Select(vm => new VmDto(vm))
            .ToListAsync();
    }

    // POST: api/vm
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Vm>> PostVm(PostVmDto vmDto)
    {
        if (await context.Vms.AnyAsync(v => v.Name == vmDto.Name))
        {
            return Conflict("A VM with this name already exists.");
        }
        if (vmDto.Name == null || vmDto.Name.Trim() == "")
        {
            return BadRequest("VM name cannot be empty.");
        }

        await context.Vms.AddAsync(new Vm() { Name = vmDto.Name });
        await context.SaveChangesAsync();

        if (vmDto.Autocreate)
        {
            try
            {
                var dockerConfig = configuration.GetSection("Docker");
                var container = await client.Containers.CreateContainerAsync(
                    new CreateContainerParameters()
                    {
                        Name = vmDto.Name,
                        Image = dockerConfig.GetSection("MonitoringServiceImage").Value,
                        Env =
                        [
                            $"Kafka:BootstrapServers={dockerConfig.GetSection("Kafka:BootstrapServers").Value}",
                            $"Kafka:Topic={configuration.GetSection("Kafka").GetSection("Topic").Value}",
                            $"VM_Name={vmDto.Name}",
                        ],
                    }
                );
                await client.Networks.ConnectNetworkAsync(
                    dockerConfig.GetSection("BrokerNetworkName").Value,
                    new NetworkConnectParameters() { Container = container.ID }
                );
                await client.Containers.StartContainerAsync(
                    container.ID,
                    new ContainerStartParameters()
                );
            }
            catch (DockerApiException)
            {
                return BadRequest("There was an error in creating the Docker container.");
            }
        }
        return Created();
    }

    // DELETE: api/vm/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVm(int id, DeleteVmDto vmDto)
    {
        var vm = await context.Vms.FindAsync(id);
        if (vm == null)
        {
            return NotFound();
        }

        if (vmDto.DeleteType == DeleteType.Reports)
        {
            vm.Reports.Clear();
        }
        else
        {
            context.Vms.Remove(vm);
            if (vmDto.DeleteType == DeleteType.VmDocker)
            {
                try
                {
                    await client.Containers.RemoveContainerAsync(
                        vm.Name,
                        new ContainerRemoveParameters() { Force = true }
                    );
                }
                catch (DockerApiException)
                {
                    return BadRequest("There was an error in removing the Docker container.");
                }
            }
        }

        await context.SaveChangesAsync();

        return NoContent();
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
        await vmStatusService.RecalculateStatusesAsync(context);
        return Ok();
    }
}
