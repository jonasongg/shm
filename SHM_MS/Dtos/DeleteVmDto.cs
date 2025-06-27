namespace SHM_MS.Dtos;

public enum DeleteType
{
    Vm,
    VmDocker,
    Reports,
}

public record DeleteVmDto
{
    public required DeleteType DeleteType { get; set; }
}
