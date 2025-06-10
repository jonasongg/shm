using SHM_MS.Models;

namespace SHM_MS.Dtos
{
    public enum VmStatus
    {
        Offline,
        Online,
    }

    public class VmDto : Vm
    {
        public VmStatus Status { get; set; }
    }
}
