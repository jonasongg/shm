using Confluent.Kafka;
using Microsoft.EntityFrameworkCore;
using Shared.Models;
using Shared.Serializers;
using SHM_MS.DbContexts;

namespace SHM_MS.Services
{
    public class ConsumerService : BackgroundService
    {
        private readonly IConsumer<string, Report> consumer;

        private readonly IDbContextFactory<ReportContext> contextFactory;
        private TaskCompletionSource<Report> taskCompletionSource = new();

        public ConsumerService(
            IConfiguration configuration,
            IDbContextFactory<ReportContext> contextFactory
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

            consumer = new ConsumerBuilder<string, Report>(config)
                .SetValueDeserializer(new JsonSerializer<Report>())
                .Build();
            consumer.Subscribe(topic);

            this.contextFactory = contextFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();

            stoppingToken.Register(() =>
            {
                consumer.Close();
                consumer.Dispose();
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                var result = consumer.Consume(stoppingToken);
                var report = result.Message.Value;

                using (var reportContext = contextFactory.CreateDbContext())
                {
                    reportContext.Reports.Add(report);
                    await reportContext.SaveChangesAsync(stoppingToken);
                }

                taskCompletionSource.TrySetResult(report);
            }
        }

        public void ResetTcs()
        {
            taskCompletionSource = new();
        }

        public Task<Report> WaitForReportAsync(CancellationToken cancellationToken)
        {
            cancellationToken.Register(() => taskCompletionSource.TrySetCanceled());
            return taskCompletionSource.Task;
        }
    }
}
