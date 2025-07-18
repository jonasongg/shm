# SHM

SHM is a C# (ASP.NET) and TypeScript (Next.js) web project that monitors the system health status of Docker containers and visualises them in real-time using charts and diagrams.

This project consists of 3 directories/components:

1. MonitoringService (.NET microservice that runs on and monitors the Docker containers)
2. SHM_MS (ASP.NET backend)
3. frontend (Next.js frontend)

The MonitoringService component is Dockerised, so you will need to install Docker on your system. Make sure that you also have PostgreSQL installed on your system.

## Getting Started

1. `git clone` this repository.
1. Run `docker compose up -pull missing` to automatically pull the necessary images and run four containers running MonitoringService as well as the Kafka broker.
1. Make sure your PostgreSQL server is up and running.
1. Navigate to the SHM_MS directory (`cd SHM_MS`) and run `dotnet restore`, followed by `dotnet run` to run the backend.
1. Configure the necessary variables for SHM_MS as specified in `appsettings.json.example`, then rename the file by removing `.example`.
1. Lastly, navigate to the frontend directory and run `npm install`, followed by `npm run dev` to run the frontend.
1. The frontend contains some E2E tests written with Cypress. To run these tests:
   - If on Linux, install the necessary Cypress dependencies: `sudo apt-get install libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb`.
   - Run `npx cypress open` in the frontend directory.

## Frontend Features

- Interactive, real-time charts from shadcn-ui (in turn from Recharts)
- Widget-like drag and drop and resizing of VM charts (from gridstack.js)
- Intuitive graph network based UI for configuring VM dependencies (from React Flow)
- Light/dark mode
- Dynamically spin up/down Docker containers directly from the frontend
