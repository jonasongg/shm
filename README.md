# SHM

SHM is a C# (ASP.NET) and TypeScript (Next.js) web project that monitors the system health status of Docker containers and visualises them in real-time using charts and diagrams.

This project consists of 3 directories/components:

1. MonitoringService (.NET microservice that runs on and monitors the Docker containers)
2. SHM_MS (ASP.NET backend)
3. frontend (Next.js frontend)

## Project Dependencies

- Docker
- PostgreSQL (see [below](#installing-postgresql-on-windows) for more instructions on installing PostgreSQL on Windows)
- TimescaleDB (refer to [their documentation](https://docs.tigerdata.com/self-hosted/latest/install/) for installation details)
  - See [below](#exclude-timescaledb) if you want to exclude TimescaleDB from the installation
- .NET 9.0 (see [below](#using-net-80) for information on using .NET 8.0)
- Node.js (note that you cannot copy the `node_modules` folder across OSes)
- Minimum Chrome version 111

## Getting Started

1. `git clone` this repository.
1. Run `docker compose up --pull missing` to automatically pull the necessary images and run four containers running MonitoringService as well as the Kafka broker.
1. Make sure your PostgreSQL + TimescaleDB database server is up and running.
1. Run `dotnet tool restore` in the root directory.
1. Navigate to the SHM_MS directory (`cd SHM_MS`).
1. Run the necessary database migrations with `dotnet ef database update`.
1. Run `dotnet run` to start the backend.
1. Configure the necessary variables for SHM_MS as specified in `appsettings.json.example`, then rename the file by removing `.example`.
1. Lastly, navigate to the frontend directory and run `npm install`, followed by `npm run dev` to run the frontend.
1. The frontend contains some E2E tests written with Cypress. To run these tests:

   - If on Linux, install the necessary Cypress dependencies:

   ```bash
   $ sudo apt-get install libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb
   ```

   - Make sure that the backend server is running.
   - Run `npx cypress open` in the frontend directory.
   - Select E2E testing, then either Chrome or Electron.

If you would like to make changes to the MonitoringService code, you will need to update the Docker image. You can do that by running in the MonitoringService folder:

```bash
$ dotnet publish --os linux --arch x64 /t:PublishContainer
```

Note that if you are not planning to make changes to its code, you can safely remove the MonitoringService project from the solution in Visual Studio.

## Other Notes

### Installing PostgreSQL on Windows

1. Install PostgreSQL from [this link](https://www.postgresql.org/download/windows/).

2. Open a terminal in the `/bin` folder of the PostgreSQL installation location.

3. Run and replace `<DBDIR>` with the directory you want to store the database in:

```powershell
initdb -D <DBDIR>
```

4. Start the server with (note that if LOGFILEDIR is the `/bin` folder, you will need adminstrator rights):

```powershell
pg_ctl -D <DBDIR> -l <LOGFILEDIR>/logfile
```

5. The default user and database name will be `postgres`.

### Exclude TimescaleDB

It's possible to not install TimescaleDB. To do so, **before running any migrations**, comment out these lines from the following files:

- In `SHM_MS/Migrations/20250604031535_Initial.cs`, comment out line 64:

```cs
migrationBuilder.Sql("SELECT create_hypertable('reports', by_range('timestamp'));");
```

- In `SHM_MS/Migrations/20250610024800_AddDataRetentionPolicy.cs`, comment out the entirety of the `Up` and `Down` function bodies.

### Using .NET 8.0

It's possible to use .NET 8.0 instead of 9.0. Simply replace `net9.0` with `net8.0` in the following line in all `.csproj` files:

```xml
<TargetFramework>net9.0</TargetFramework>
```

You will need to downgrade the NuGet package `Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore` to version 8.

## Frontend Features

- Interactive, real-time charts from shadcn-ui (in turn from Recharts)
- Widget-like drag and drop and resizing of VM charts (from gridstack.js)
- Intuitive graph network based UI for configuring VM dependencies (from React Flow)
- Light/dark mode
- Dynamically spin up/down Docker containers directly from the frontend
