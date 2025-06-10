using Confluent.Kafka;
using Shared.Dtos;
using Shared.Serializers;

namespace MonitoringService.Services
{
    public class ProducerService : IDisposable
    {
        private readonly IConfiguration configuration;
        private readonly IProducer<string, ReportDto> producer;

        public ProducerService(IConfiguration configuration)
        {
            this.configuration = configuration;

            var bootstrapServers = configuration
                .GetSection("Kafka")
                .GetSection("BootstrapServers")
                .Value;
            var config = new ProducerConfig { BootstrapServers = bootstrapServers };

            producer = new ProducerBuilder<string, ReportDto>(config)
                .SetValueSerializer(new JsonSerializer<ReportDto>())
                .Build();
        }

        public async Task<DeliveryResult<string, ReportDto>> ProduceAsync(
            string name,
            ReportDto message,
            CancellationToken cancellationToken
        )
        {
            var topic = configuration.GetSection("Kafka").GetSection("Topic").Value;

            var kafkaMessage = new Message<string, ReportDto> { Key = name, Value = message };
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
