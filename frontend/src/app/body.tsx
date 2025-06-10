"use client";

import { bytesFormatter, toAbsoluteUrl } from "@/lib/utils";
import { RawDataReport, RawVm } from "@/types/types";
import { useEffect, useState } from "react";
import Vm from "./vm";

export default function Body({ vms: _vms }: { vms: RawVm[] }) {
  const [vms, setVms] = useState(_vms);

  useEffect(() => {
    // initiate stream
    const reportsEventSource = new EventSource(toAbsoluteUrl("/report/stream"));
    const vmStatusEventSource = new EventSource(toAbsoluteUrl("/vm/status"));

    reportsEventSource.onmessage = (event) => {
      const dataReport: RawDataReport = JSON.parse(event.data);

      setVms((d) => {
        const vm = d.find(({ id }) => id === dataReport.vmId);
        if (!vm) return d;

        const updatedReports = [
          dataReport,
          ...vm.reports.slice(0, vm.reports.length < 10 ? undefined : -1),
        ];
        const updatedVm: RawVm = {
          ...vm,
          reports: updatedReports,
          status: "Online",
        };
        return d.map((vm) => (vm.id === dataReport.vmId ? updatedVm : vm));
      });
    };

    vmStatusEventSource.onmessage = (event) => {
      const vms: RawVm[] = JSON.parse(event.data);

      setVms((d) =>
        d.map((vm) => {
          const status = vms.find((v) => v.id === vm.id)?.status;
          return {
            ...vm,
            // reports: status === "Offline" ? [] : vm.reports,
            status: status ?? vm.status,
          };
        }),
      );
    };

    return () => {
      reportsEventSource.close();
      vmStatusEventSource.close();
    };
  }, []);

  const transformedVms = vms.map((vm) => ({
    ...vm,
    reports: vm.reports.map((d) => ({
      ...d,
      timestamp: new Date(d.timestamp),
      totalMemory: bytesFormatter(d.totalMemory),
      usedMemory: bytesFormatter(d.totalMemory - d.freeMemory),
      memoryUsagePercent:
        ((d.totalMemory - d.freeMemory) / d.totalMemory) * 100,
      totalSpace: bytesFormatter(d.totalSpace),
      usedSpace: bytesFormatter(d.totalSpace - d.freeSpace),
      spaceUsagePercent: ((d.totalSpace - d.freeSpace) / d.totalSpace) * 100,
    })),
  }));

  return (
    <main className="p-8 gap-8 flex-1 font-(family-name:--font-geist-sans) grid grid-cols-1 md:grid-cols-2">
      {transformedVms.map((vm, i) => (
        <Vm {...vm} key={i} />
      ))}
    </main>
  );
}
