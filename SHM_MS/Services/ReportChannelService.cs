using System.Threading.Channels;
using Shared.DTOs;

namespace SHM_MS.Services
{
    public class ReportChannelService
    {
        private readonly Channel<ReportDTO> channel = Channel.CreateUnbounded<ReportDTO>();

        public async Task WriteAsync(ReportDTO metric, CancellationToken cancellationToken)
        {
            await channel.Writer.WriteAsync(metric, cancellationToken);
        }

        public ValueTask<ReportDTO> ReadAsync(CancellationToken cancellationToken)
        {
            return channel.Reader.ReadAsync(cancellationToken);
        }
    }
}
