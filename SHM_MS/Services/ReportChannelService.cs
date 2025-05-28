using System.Threading.Channels;
using Shared.Models;

namespace SHM_MS.Services
{
    public class ReportChannelService
    {
        private readonly Channel<Report> channel = Channel.CreateUnbounded<Report>();

        public async Task WriteAsync(Report metric, CancellationToken cancellationToken)
        {
            await channel.Writer.WriteAsync(metric, cancellationToken);
        }

        public ValueTask<Report> ReadAsync(CancellationToken cancellationToken)
        {
            return channel.Reader.ReadAsync(cancellationToken);
        }
    }
}
