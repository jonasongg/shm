namespace SHM_MS.Models
{
    public class VM
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public ICollection<Report> Reports { get; } = [];
    }
}
