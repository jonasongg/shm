using Microsoft.EntityFrameworkCore;
using Shared.Models;

class ReportDb(DbContextOptions<ReportDb> options) : DbContext(options)
{
    public DbSet<Report> Reports => Set<Report>();
}
