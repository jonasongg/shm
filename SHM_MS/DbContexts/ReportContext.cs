using Microsoft.EntityFrameworkCore;
using Shared.DTOs;

namespace SHM_MS.DbContexts
{
    public class ReportContext(DbContextOptions<ReportContext> options) : DbContext(options)
    {
        public DbSet<ReportDTO> Reports => Set<ReportDTO>();
    }
}
