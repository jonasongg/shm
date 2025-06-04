using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHM_MS.DbContexts;
using SHM_MS.Models;

namespace SHM_MS.Controllers
{
    [Route("api/vm")]
    [ApiController]
    public class VmController(SHMContext context) : ControllerBase
    {
        // GET: api/vm
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vm>>> GetVms()
        {
            return await context.Vms.ToListAsync();
        }

        // GET: api/vm/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Vm>> GetVm(int id)
        {
            var vm = await context.Vms.FindAsync(id);

            if (vm == null)
            {
                return NotFound();
            }

            return vm;
        }

        // POST: api/vm
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Vm>> PostVm(Vm vm)
        {
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
    }
}
