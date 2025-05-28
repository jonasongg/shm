using Microsoft.EntityFrameworkCore;
using Shared.Models;

namespace SHM_MS.DbContexts
{
    public class ReportContext(DbContextOptions<ReportContext> options) : DbContext(options)
    {
        public DbSet<Report> Reports => Set<Report>();
    }
}
