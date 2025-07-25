using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Shared.Dtos;
using Shared.Serializers;
using SHM_MS.DbContexts;
using SHM_MS.Dtos;
using SHM_MS.Interfaces;
using SHM_MS.Models;

namespace SHM_MS.Services;

public class ConsumerService : BackgroundService
{
    private readonly IConsumer<string, KafkaReportDto> consumer;
    private readonly IDbContextFactory<SHMContext> contextFactory;
    private readonly IChannelServiceWriter<ReportDto> reportChannelServiceWriter;
    private readonly ILogger<ConsumerService> logger;
    private readonly VmStatusService vmStatusService;
    private readonly IChannelService<SystemStatusDto> systemStatusChannelServiceWriter;
    private readonly IClock clock;

    public ConsumerService(
        IConfiguration configuration,
        IDbContextFactory<SHMContext> contextFactory,
        IChannelServiceWriter<ReportDto> reportChannelServiceWriter,
        ILogger<ConsumerService> logger,
        VmStatusService vmStatusService,
        IChannelService<SystemStatusDto> systemStatusChannelServiceWriter,
        IClock clock
    )
    {
        this.contextFactory = contextFactory;
        this.reportChannelServiceWriter = reportChannelServiceWriter;
        this.logger = logger;
        this.vmStatusService = vmStatusService;
        this.systemStatusChannelServiceWriter = systemStatusChannelServiceWriter;
        this.clock = clock;

        var bootstrapServers = configuration
            .GetSection("Kafka")
            .GetSection("BootstrapServers")
            .Value;
        var topic = configuration.GetSection("Kafka").GetSection("Topic").Value;

        var config = new ConsumerConfig
        {
            BootstrapServers = bootstrapServers,
            GroupId = Guid.NewGuid().ToString(),
        };

        consumer = new ConsumerBuilder<string, KafkaReportDto>(config)
            .SetValueDeserializer(new JsonSerializer<KafkaReportDto>())
            .SetErrorHandler(ErrorHandler)
            .Build();
        consumer.Subscribe(topic);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.Register(() =>
        {
            consumer.Close();
            consumer.Dispose();
        });

        while (!stoppingToken.IsCancellationRequested)
        {
            var result = await Task.Run(() => consumer.Consume(stoppingToken), stoppingToken);

            await UpdateSystemStatusIfDifferent(SystemStatus.Ok);

            var reportDTO = result.Message.Value;

            await using var context = await contextFactory.CreateDbContextAsync(stoppingToken);
            var vm = await context.Vms.FirstOrDefaultAsync(
                v => v.Name == reportDTO.Name,
                stoppingToken
            );

            if (vm is null)
            {
                logger.LogError("VM with name {report} not found in the database.", reportDTO.Name);
            }
            else
            {
                // VmId is automatic
                var report = new Report
                {
                    VmId = vm.Id,
                    Timestamp = reportDTO.Timestamp,
                    TotalMemory = reportDTO.TotalMemory,
                    FreeMemory = reportDTO.FreeMemory,
                    CpuUsagePercent = reportDTO.CpuUsagePercent,
                    TotalSpace = reportDTO.TotalSpace,
                    FreeSpace = reportDTO.FreeSpace,
                };
                await context.Reports.AddAsync(report, stoppingToken);
                await context.SaveChangesAsync(stoppingToken);

                vmStatusService.NotifyReportReceived(report.VmId);
                await reportChannelServiceWriter.WriteAsync(new ReportDto(report), stoppingToken);
            }
        }
    }

    private async void ErrorHandler(IConsumer<string, KafkaReportDto> consumer, Error error)
    {
        await systemStatusChannelServiceWriter.WriteAsync(
            new SystemStatusDto { Status = SystemStatus.KafkaBrokerDown },
            default
        );

        await UpdateSystemStatusIfDifferent(SystemStatus.KafkaBrokerDown);
    }

    private async Task UpdateSystemStatusIfDifferent(SystemStatus newStatus)
    {
        await using var context = await contextFactory.CreateDbContextAsync();
        var lastUpdate = await context
            .SystemStatusHistories.OrderByDescending(h => h.Timestamp)
            .FirstOrDefaultAsync();

        if (lastUpdate is null || lastUpdate.Status != newStatus)
        {
            await context.SystemStatusHistories.AddAsync(
                new SystemStatusHistory()
                {
                    Timestamp = clock.GetCurrentInstant(),
                    Status = newStatus,
                }
            );
            await context.SaveChangesAsync();
        }
    }
}
