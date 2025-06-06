"use client";

import { bytesFormatter, toAbsoluteUrl } from "@/lib/utils";
import { DataReport, RawDataReport } from "@/types/types";
import { useEffect, useState } from "react";
import Vm from "./vm";

export default function Body({
  data: _data,
}: {
  data: Record<string, RawDataReport[]>;
}) {
  const [data, setData] = useState(_data);

  useEffect(() => {
    // initiate stream
    const eventSource = new EventSource(toAbsoluteUrl("/report/stream"));
    eventSource.onmessage = (event) => {
      const dataReport: RawDataReport = JSON.parse(event.data);
      const vmName = Object.entries(data).find(
        ([_, [{ vmId }]]) => vmId === dataReport.vmId,
      )?.[0];

      if (vmName != null)
        setData((d) => ({
          ...d,
          [vmName]: [
            dataReport,
            ...d[vmName].slice(0, d[vmName].length < 10 ? undefined : -1),
          ],
        }));
    };

    return () => eventSource.close();
  });

  const transformedData: Record<string, DataReport[]> = {};
  for (const name in data) {
    const transformedReports = data[name].map((d) => ({
      ...d,
      timestamp: new Date(d.timestamp),
      totalMemory: bytesFormatter(d.totalMemory),
      usedMemory: bytesFormatter(d.totalMemory - d.freeMemory),
      memoryUsagePercent:
        ((d.totalMemory - d.freeMemory) / d.totalMemory) * 100,
      totalSpace: bytesFormatter(d.totalSpace),
      usedSpace: bytesFormatter(d.totalSpace - d.freeSpace),
      spaceUsagePercent: ((d.totalSpace - d.freeSpace) / d.totalSpace) * 100,
    }));
    transformedData[name] = transformedReports;
  }

  return (
    <main className="p-8 gap-8 flex-1 font-(family-name:--font-geist-sans) grid grid-cols-1 md:grid-cols-2">
      {Object.entries(transformedData).map(([name, reportForVm], i) => (
        <Vm name={name} reports={reportForVm} key={i} />
      ))}
    </main>
  );
}
