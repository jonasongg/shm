using Microsoft.EntityFrameworkCore;
using SHM_MS.DbContexts;
using SHM_MS.Services;

var AllowedSpecificOrigins = "_allowedSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddDbContextFactory<SHMContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Postgres"))
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddSingleton<ReportChannelService>();
builder.Services.AddHostedService<ConsumerService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        AllowedSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:3000");
        }
    );
});

var app = builder.Build();
app.UseCors(AllowedSpecificOrigins);
app.MapControllers();
app.Run();
