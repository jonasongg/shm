using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
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

    public ConsumerService(
        IConfiguration configuration,
        IDbContextFactory<SHMContext> contextFactory,
        IChannelServiceWriter<ReportDto> reportChannelServiceWriter,
        ILogger<ConsumerService> logger,
        VmStatusService vmStatusService,
        IChannelService<SystemStatusDto> systemStatusChannelServiceWriter
    )
    {
        this.contextFactory = contextFactory;
        this.reportChannelServiceWriter = reportChannelServiceWriter;
        this.logger = logger;
        this.vmStatusService = vmStatusService;
        this.systemStatusChannelServiceWriter = systemStatusChannelServiceWriter;

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
            var reportDTO = result.Message.Value;

            await using var context = contextFactory.CreateDbContext();
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
    }
}
