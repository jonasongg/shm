using SHM_MS.Models;

namespace SHM_MS.Dtos
{
    public enum VmStatus
    {
        Offline,
        Online,
        Degraded,
    }

    public class VmDto : Vm
    {
        public VmStatus Status { get; set; }
    }
}
