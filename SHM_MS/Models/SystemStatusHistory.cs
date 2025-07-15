using Microsoft.EntityFrameworkCore;
using NodaTime;
using SHM_MS.Dtos;

namespace SHM_MS.Models;

[PrimaryKey(nameof(Timestamp))]
public class SystemStatusHistory
{
    public required Instant Timestamp { get; set; }
    public required SystemStatus Status { get; set; }
}
