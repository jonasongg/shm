using Confluent.Kafka;
using Shared.Models;
using Shared.Serializers;

namespace MonitoringService.Services
{
    public class ProducerService : IDisposable
    {
        private readonly IConfiguration configuration;
        private readonly IProducer<string, Report> producer;

        public ProducerService(IConfiguration configuration)
        {
            this.configuration = configuration;

            var bootstrapServers = configuration
                .GetSection("Kafka")
                .GetSection("BootstrapServers")
                .Value;
            var config = new ProducerConfig { BootstrapServers = bootstrapServers };

            producer = new ProducerBuilder<string, Report>(config)
                .SetValueSerializer(new JsonSerializer<Report>())
                .Build();
        }

        public async Task<DeliveryResult<string, Report>> ProduceAsync(
            Report message,
            CancellationToken cancellationToken
        )
        {
            var topic = configuration.GetSection("Kafka").GetSection("Topic").Value;

            var kafkaMessage = new Message<string, Report> { Value = message };
            return await producer.ProduceAsync(topic, kafkaMessage, cancellationToken);
        }

        public void Dispose()
        {
            producer.Flush();
            producer.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
