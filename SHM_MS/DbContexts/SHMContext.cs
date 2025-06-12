using Microsoft.EntityFrameworkCore;
using SHM_MS.Models;

namespace SHM_MS.DbContexts;

public class SHMContext(DbContextOptions<SHMContext> options) : DbContext(options)
{
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<Vm> Vms => Set<Vm>();
}
