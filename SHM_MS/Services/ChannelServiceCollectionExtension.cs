using SHM_MS.Dtos;
using SHM_MS.Interfaces;

namespace SHM_MS.Services;

public static class ChannelServiceCollectionExtension
{
    public static IServiceCollection AddChannelServices(this IServiceCollection services)
    {
        services.AddSingleton<IChannelService<ReportDto>, ReportChannelService>();
        services.AddSingleton<IChannelService<VmStatusDto>, VmStatusChannelService>();
        services.AddSingleton<IChannelService<SystemStatusDto>, SystemStatusChannelService>();

        services.AddSingleton<IChannelServiceReader>(sp =>
            sp.GetRequiredService<IChannelService<ReportDto>>()
        );
        services.AddSingleton<IChannelServiceReader>(sp =>
            sp.GetRequiredService<IChannelService<VmStatusDto>>()
        );
        services.AddSingleton<IChannelServiceReader>(sp =>
            sp.GetRequiredService<IChannelService<SystemStatusDto>>()
        );

        services.AddSingleton<IChannelServiceWriter<ReportDto>>(sp =>
            sp.GetRequiredService<IChannelService<ReportDto>>()
        );
        services.AddSingleton<IChannelServiceWriter<VmStatusDto>>(sp =>
            sp.GetRequiredService<IChannelService<VmStatusDto>>()
        );
        services.AddSingleton<IChannelServiceWriter<SystemStatusDto>>(sp =>
            sp.GetRequiredService<IChannelService<SystemStatusDto>>()
        );
        return services;
    }
}
