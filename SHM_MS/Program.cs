using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using SHM_MS.DbContexts;
using SHM_MS.Services;

var AllowedSpecificOrigins = "_allowedSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(NodaConverters.InstantConverter);
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddDbContextFactory<SHMContext>(options =>
    options
        .UseNpgsql(
            builder.Configuration.GetConnectionString("Postgres"),
            options => options.UseNodaTime()
        )
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddHostedService<ConsumerService>();
builder.Services.AddSingleton<IClock>(SystemClock.Instance);
builder.Services.AddSingleton<VmStatusService>();
builder.Services.AddChannelServices();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        AllowedSpecificOrigins,
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .WithMethods("POST", "DELETE", "GET", "PUT");
        }
    );
});

var app = builder.Build();
app.UseCors(AllowedSpecificOrigins);
app.MapControllers();

await app.Services.GetRequiredService<VmStatusService>().RecalculateStatusesOnStartupAsync();

app.Run();
