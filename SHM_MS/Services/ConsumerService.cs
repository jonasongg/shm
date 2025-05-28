using Confluent.Kafka;
using Shared.Models;
using Shared.Serializers;

namespace SHM_MS.Services
{
    public class ConsumerService : BackgroundService
    {
        private readonly IConsumer<string, Report> consumer;
        private TaskCompletionSource<Report> taskCompletionSource = new();

        public ConsumerService(IConfiguration configuration)
        {
            var bootstrapServers = configuration
                .GetSection("Kafka")
                .GetSection("BootstrapServers")
                .Value;
            var topic = configuration.GetSection("Kafka").GetSection("Topic").Value;

            var config = new ConsumerConfig { BootstrapServers = bootstrapServers };

            consumer = new ConsumerBuilder<string, Report>(config)
                .SetValueDeserializer(new JsonSerializer<Report>())
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
                var result = consumer.Consume(stoppingToken);
                taskCompletionSource.TrySetResult(result.Message.Value);
            }
        }

        public void ResetTcs()
        {
            taskCompletionSource = new();
        }

        public Task<Report> WaitForReportAsync(CancellationToken cancellationToken)
        {
            cancellationToken.Register(taskCompletionSource.SetCanceled);
            return taskCompletionSource.Task;
        }
    }
}
