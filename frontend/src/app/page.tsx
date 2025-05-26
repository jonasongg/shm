"use client";

import CpuChart from "@/components/cpuChart";
import DiskChart from "@/components/diskChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<Partial<Record<string, DataReportForVm[]>>>(
    {},
  );

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:5043/reports");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const json: DataReport[] = await response.json();
      const transformedData = json.map((data) => ({
        ...data,
        timestamp: new Date(data.timestamp),
      }));

      setData(Object.groupBy(transformedData, ({ name }) => name));
    })();
  }, []);
  return (
    <>
      <header className="font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      {Object.entries(data).length === 0 ? (
        <div className="h-full flex items-center justify-center text-xl text-gray-500">
          No active VMs to display
        </div>
      ) : (
        <main className="p-8 gap-8 grid grid-cols-2 grid-rows-2 flex-1 font-(family-name:--font-geist-sans)">
          {Object.entries(data).map(([name, reportForVm], i) => (
            <Card key={i}>
              <CardHeader className="text-xl">
                <CardTitle>{name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                {reportForVm ? (
                  <CpuChart data={reportForVm} className="flex-3/4" />
                ) : (
                  "No CPU data found."
                )}
                <Separator className="my-3" />
                {reportForVm ? (
                  <DiskChart data={reportForVm} className="flex-1/4" />
                ) : (
                  "No memory data found."
                )}
              </CardContent>
            </Card>
          ))}
        </main>
      )}
    </>
  );
}
