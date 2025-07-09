using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace SHM_MS.Models;

[PrimaryKey(nameof(Timestamp), nameof(VmId))]
public class VmStatusHistory
{
    public required Instant Timestamp { get; set; }
    public required int VmId { get; set; }
    public Vm Vm { get; set; } = null!;
    public required VmStatus Status { get; set; }
}
