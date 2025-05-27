using System.Formats.Asn1;
using Confluent.Kafka;
using Shared.Models;

namespace MonitoringService.Services
{
    public class ProducerService : IDisposable
    {
        private readonly IProducer<string, Report> producer;

        public ProducerService(IConfiguration configuration)
        {
            var bootstrapServers = configuration["Kafka_BootstrapServers"];
            var config = new ProducerConfig { BootstrapServers = bootstrapServers };

            producer = new ProducerBuilder<string, Report>(config).Build();
        }

        public async Task ProduceAsync(Report message)
        {
            var kafkaMessage = new Message<string, Report> { Value = message };
            await producer.ProduceAsync("reports", kafkaMessage);
        }

        public void Dispose()
        {
            producer.Flush();
            producer.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
