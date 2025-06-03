using System.Text.Json;
using Confluent.Kafka;

namespace Shared.Serializers
{
    public class JsonSerializer<T> : ISerializer<T>, IDeserializer<T>
    {
        public byte[] Serialize(T data, SerializationContext context)
        {
            return JsonSerializer.SerializeToUtf8Bytes(data);
        }

        public T Deserialize(ReadOnlySpan<byte> data, bool isNull, SerializationContext context)
        {
#pragma warning disable CS8603 // Possible null reference return.
            return isNull ? default : JsonSerializer.Deserialize<T>(data);
#pragma warning restore CS8603 // Possible null reference return.
        }
    }
}
