using System.Threading.Channels;
using SHM_MS.Models;

namespace SHM_MS.Services
{
    public class ReportChannelService
    {
        private readonly Channel<Report> channel = Channel.CreateUnbounded<Report>();

        public async Task WriteAsync(Report report, CancellationToken cancellationToken)
        {
            await channel.Writer.WriteAsync(report, cancellationToken);
        }

        public ValueTask<Report> ReadAsync(CancellationToken cancellationToken)
        {
            return channel.Reader.ReadAsync(cancellationToken);
        }
    }
}
