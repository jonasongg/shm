using Confluent.Kafka;
using Shared.Dtos;
using Shared.Serializers;

namespace MonitoringService.Services
{
    public class ProducerService : IDisposable
    {
        private readonly IConfiguration configuration;
        private readonly IProducer<string, KafkaReportDto> producer;

        public ProducerService(IConfiguration configuration)
        {
            this.configuration = configuration;

            var bootstrapServers = configuration
                .GetSection("Kafka")
                .GetSection("BootstrapServers")
                .Value;
            var config = new ProducerConfig { BootstrapServers = bootstrapServers };

            producer = new ProducerBuilder<string, KafkaReportDto>(config)
                .SetValueSerializer(new JsonSerializer<KafkaReportDto>())
                .Build();
        }

        public async Task<DeliveryResult<string, KafkaReportDto>> ProduceAsync(
            string name,
            KafkaReportDto message,
            CancellationToken cancellationToken
        )
        {
            var topic = configuration.GetSection("Kafka").GetSection("Topic").Value;

            var kafkaMessage = new Message<string, KafkaReportDto> { Key = name, Value = message };
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
