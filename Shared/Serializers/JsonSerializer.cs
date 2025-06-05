using System.Text.Json;
using Confluent.Kafka;
using NodaTime.Serialization.SystemTextJson;

namespace Shared.Serializers
{
    public class JsonSerializer<T> : ISerializer<T>, IDeserializer<T>
    {
        private readonly JsonSerializerOptions options = new();

        public JsonSerializer()
        {
            options.Converters.Add(NodaConverters.LocalDateTimeConverter);
        }

        public byte[] Serialize(T data, SerializationContext context)
        {
            return JsonSerializer.SerializeToUtf8Bytes(data, options);
        }

        public T Deserialize(ReadOnlySpan<byte> data, bool isNull, SerializationContext context)
        {
#pragma warning disable CS8603 // Possible null reference return.
            return isNull ? default : JsonSerializer.Deserialize<T>(data, options);
#pragma warning restore CS8603 // Possible null reference return.
        }
    }
}
