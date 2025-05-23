"use client";

import CpuChart from "@/components/cpuChart";
import MemChart from "@/components/memChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] =
    useState<Record<string, DataReportForVm[] | undefined>>();

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:5043/reports");
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
      <main className="p-8 gap-8 grid grid-cols-2 grid-rows-2 flex-1">
        {data &&
          [...Object.entries(data), ...Object.entries(data)].map(
            ([name, reportForVm], i) => (
              <Card key={i} className="font-(family-name:--font-geist-sans)">
                <CardHeader className="text-xl">
                  <CardTitle>{name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {reportForVm ? (
                    <CpuChart data={reportForVm} />
                  ) : (
                    "No CPU data found."
                  )}
                  {reportForVm ? (
                    <MemChart data={reportForVm} />
                  ) : (
                    "No memory data found."
                  )}
                </CardContent>
              </Card>
            ),
          )}
      </main>
    </>
  );
}
