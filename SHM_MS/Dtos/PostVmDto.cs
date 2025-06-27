namespace SHM_MS.Dtos;

public record PostVmDto
{
    public required string Name { get; set; }
    public bool Autocreate { get; set; }
}
