using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using Shared.Dtos;
using Shared.Serializers;
using SHM_MS.DbContexts;
using SHM_MS.Models;

namespace SHM_MS.Services
{
    public class ConsumerService : BackgroundService
    {
        private readonly IConsumer<string, ReportDto> consumer;
        private readonly IDbContextFactory<SHMContext> contextFactory;
        private readonly ReportChannelService reportChannelService;
        private readonly ILogger<ConsumerService> logger;

        public ConsumerService(
            IConfiguration configuration,
            IDbContextFactory<SHMContext> contextFactory,
            ReportChannelService reportChannelService,
            ILogger<ConsumerService> logger
        )
        {
            this.contextFactory = contextFactory;
            this.reportChannelService = reportChannelService;
            this.logger = logger;

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

            consumer = new ConsumerBuilder<string, ReportDto>(config)
                .SetValueDeserializer(new JsonSerializer<ReportDto>())
                .Build();
            consumer.Subscribe(topic);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // await Task.Yield();

            stoppingToken.Register(() =>
            {
                consumer.Close();
                consumer.Dispose();
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                var result = await Task.Run(() => consumer.Consume(stoppingToken), stoppingToken);
                var reportDTO = result.Message.Value;

                using var context = contextFactory.CreateDbContext();
                var vm = await context.Vms.FirstOrDefaultAsync(
                    v => v.Name == reportDTO.Name,
                    stoppingToken
                );

                if (vm is null)
                {
                    logger.LogError(
                        "VM with name {report} not found in the database.",
                        reportDTO.Name
                    );
                }
                else
                {
                    // VmId is automatic
                    var report = new Report
                    {
                        Vm = vm,
                        Timestamp = reportDTO.Timestamp,
                        TotalMemory = reportDTO.TotalMemory,
                        FreeMemory = reportDTO.FreeMemory,
                        CpuUsagePercent = reportDTO.CpuUsagePercent,
                        TotalSpace = reportDTO.TotalSpace,
                        FreeSpace = reportDTO.FreeSpace,
                    };
                    context.Reports.Add(report);

                    await context.SaveChangesAsync(stoppingToken);
                    await reportChannelService.WriteAsync(report, stoppingToken);
                }
            }
        }
    }
}
