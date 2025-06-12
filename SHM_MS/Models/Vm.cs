namespace SHM_MS.Models
{
    public class Vm
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public ICollection<Report> Reports { get; } = [];
        public ICollection<Vm> DependentOns { get; } = [];
        public ICollection<Vm> Dependants { get; } = [];
    }
}
