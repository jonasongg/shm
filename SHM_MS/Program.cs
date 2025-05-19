using System.Management;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var searcher = new ManagementObjectSearcher("select * from Win32_OperatingSystem");
var obj = searcher.Get().OfType<ManagementObject>().FirstOrDefault();
var totalMemory = obj["TotalVisibleMemorySize"];

app.MapGet("/", () => totalMemory);

app.Run();
