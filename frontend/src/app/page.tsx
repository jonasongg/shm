"use client";

import CpuChart from "@/components/cpuChart";
import DiskChart from "@/components/diskChart";
import MemChart from "@/components/memChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

export const numberFormatter = (x: number) =>
  x.toLocaleString(undefined, { maximumFractionDigits: 1 });
const bytesFormatter = (x: number) => (x / 1024 / 1024).toFixed(1);

export default function Home() {
  const [data, setData] = useState<RawDataReport[]>([]);
  const isMdOrLarger = useMediaQuery({ minWidth: 768 });

  useEffect(() => {
    // initiate stream
    const eventSource = new EventSource("http://localhost:5043/reports/stream");
    eventSource.onmessage = (event) => {
      const dataReport: RawDataReport = JSON.parse(event.data);
      setData((data) => [
        dataReport,
        ...data.slice(0, data.length < 10 ? undefined : -1),
      ]);
    };

    (async () => {
      // initial fetch
      const response = await fetch("http://localhost:5043/reports");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const json: RawDataReport[] = await response.json();
      setData(json);
    })();

    return () => eventSource.close();
  }, []);

  const transformedData: DataReport[] = data.map((d) => ({
    ...d,
    timestamp: new Date(d.timestamp),
    totalMemory: bytesFormatter(d.totalMemory),
    usedMemory: bytesFormatter(d.totalMemory - d.freeMemory),
    memoryUsagePercent: ((d.totalMemory - d.freeMemory) / d.totalMemory) * 100,
    totalSpace: bytesFormatter(d.totalSpace),
    usedSpace: bytesFormatter(d.totalSpace - d.freeSpace),
    spaceUsagePercent: ((d.totalSpace - d.freeSpace) / d.totalSpace) * 100,
  }));
  const groupedData = Object.groupBy(transformedData, ({ name }) => name);

  return (
    <>
      <header className="font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      {Object.entries(groupedData).length === 0 ? (
        <div className="h-full flex items-center justify-center text-xl text-gray-500">
          No active VMs to display
        </div>
      ) : (
        <main className="p-8 gap-8 flex-1 font-(family-name:--font-geist-sans) grid grid-cols-1 md:grid-cols-2">
          {Object.entries(groupedData).map(([name, reportForVm], i) => (
            <Card key={i} className="h-140 md:h-81">
              <CardHeader className="text-xl">
                <CardTitle>{name}</CardTitle>
              </CardHeader>
              {reportForVm ? (
                <CardContent className="flex flex-col h-full">
                  <div className="flex flex-col flex-7/8 md:flex-row md:flex-3/4">
                    <CpuChart
                      data={reportForVm}
                      className="flex-1/2 md:flex-2/3"
                    />
                    <Separator
                      className="my-2 md:my-0 md:mx-2"
                      orientation={isMdOrLarger ? "vertical" : "horizontal"}
                    />
                    <MemChart
                      data={reportForVm}
                      className="flex-1/2 md:flex-1/3"
                    />
                  </div>
                  <Separator className="my-2" />
                  <DiskChart
                    data={reportForVm}
                    className="flex-1/8 md:flex-1/4"
                  />
                </CardContent>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for this VM
                </div>
              )}
            </Card>
          ))}
        </main>
      )}
    </>
  );
}
