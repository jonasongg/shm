using Confluent.Kafka;
using Shared.DTOs;
using Shared.Serializers;

namespace MonitoringService.Services
{
    public class ProducerService : IDisposable
    {
        private readonly IConfiguration configuration;
        private readonly IProducer<string, ReportDTO> producer;

        public ProducerService(IConfiguration configuration)
        {
            this.configuration = configuration;

            var bootstrapServers = configuration
                .GetSection("Kafka")
                .GetSection("BootstrapServers")
                .Value;
            var config = new ProducerConfig { BootstrapServers = bootstrapServers };

            producer = new ProducerBuilder<string, ReportDTO>(config)
                .SetValueSerializer(new JsonSerializer<ReportDTO>())
                .Build();
        }

        public async Task<DeliveryResult<string, ReportDTO>> ProduceAsync(
            string name,
            ReportDTO message,
            CancellationToken cancellationToken
        )
        {
            var topic = configuration.GetSection("Kafka").GetSection("Topic").Value;

            var kafkaMessage = new Message<string, ReportDTO> { Key = name, Value = message };
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
