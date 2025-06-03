using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using Shared.DTOs;
using Shared.Serializers;
using SHM_MS.DbContexts;
using SHM_MS.Models;

namespace SHM_MS.Services
{
    public class ConsumerService : BackgroundService
    {
        private readonly IConsumer<string, ReportDTO> consumer;

        private readonly IDbContextFactory<SHMContext> contextFactory;
        private readonly ReportChannelService reportChannelService;

        public ConsumerService(
            IConfiguration configuration,
            IDbContextFactory<SHMContext> contextFactory,
            ReportChannelService reportChannelService
        )
        {
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

            consumer = new ConsumerBuilder<string, ReportDTO>(config)
                .SetValueDeserializer(new JsonSerializer<ReportDTO>())
                .Build();
            consumer.Subscribe(topic);

            this.contextFactory = contextFactory;
            this.reportChannelService = reportChannelService;
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
                var report = result.Message.Value;

                using (var context = contextFactory.CreateDbContext())
                {
                    var vm =
                        await context.VMs.FirstOrDefaultAsync(
                            v => v.Name == report.Name,
                            stoppingToken
                        )
                        ?? throw new InvalidOperationException(
                            $"VM with name {report.Name} not found in the database."
                        );

                    context.Reports.Add(
                        new Report
                        {
                            VM = vm,
                            Timestamp = report.Timestamp,
                            TotalMemory = report.TotalMemory,
                            FreeMemory = report.FreeMemory,
                            CpuUsagePercent = report.CpuUsagePercent,
                            TotalSpace = report.TotalSpace,
                            FreeSpace = report.FreeSpace,
                        }
                    );
                    await context.SaveChangesAsync(stoppingToken);
                }

                await reportChannelService.WriteAsync(report, stoppingToken);
            }
        }
    }
}
