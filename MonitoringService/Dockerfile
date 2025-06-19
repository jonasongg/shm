FROM mcr.microsoft.com/dotnet/sdk
WORKDIR /app
COPY --from=app ../MonitoringService ./MonitoringService
COPY --from=app ../Shared ./Shared
WORKDIR /app/MonitoringService
RUN apt-get update && apt-get install -y ca-certificates
COPY dso_certificate.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
RUN dotnet restore
CMD ["dotnet", "run"]
