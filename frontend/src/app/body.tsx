"use client";

import { bytesFormatter, toAbsoluteUrl } from "@/lib/utils";
import { RawDataReport, RawVm, VmStatusUpdate, VmType } from "@/types/types";
import { useEffect, useState } from "react";
import Vm from "../components/vm";

export default function Body({ vms: _vms }: { vms: RawVm[] }) {
  const [vms, setVms] = useState(_vms);

  useEffect(() => {
    // initiate stream
    const streamEventSource = new EventSource(toAbsoluteUrl("/stream"));

    streamEventSource.addEventListener("Report", (event) => {
      const dataReport: RawDataReport = JSON.parse(event.data);

      setVms((d) => {
        const vm = d.find(({ id }) => id === dataReport.vmId);
        if (!vm) return d;

        let newReports = vm.reports.filter(
          ({ timestamp }) =>
            new Date(timestamp).valueOf() > new Date().valueOf() - 15000,
        );
        if (vm.reports.length >= 10) newReports = newReports.slice(0, -1);

        const updatedVm: RawVm = {
          ...vm,
          reports: [dataReport, ...newReports],
        };
        return d.map((vm) => (vm.id === dataReport.vmId ? updatedVm : vm));
      });
    });

    streamEventSource.addEventListener("VmStatus", (event) => {
      const { id, status }: VmStatusUpdate = JSON.parse(event.data);
      setVms((d) => d.map((vm) => (vm.id === id ? { ...vm, status } : vm)));
    });

    return () => streamEventSource.close();
  }, []);

  const transformedVms: VmType[] = vms.map((vm) => ({
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

  const getOfflineDependencies = (vm: VmType) => {
    const dependencies = [...vm.dependencyIds];
    const offlineDependencies: VmType[] = [];
    while (dependencies.length > 0) {
      const dependencyId = dependencies.pop();
      if (dependencyId == null) continue;

      const dependency = transformedVms.find((vm) => vm.id === dependencyId);
      if (!dependency) continue;

      dependencies.push(...dependency.dependencyIds);
      if (dependency.status === "Offline") offlineDependencies.push(dependency);
    }

    return offlineDependencies;
  };

  return (
    <main className="p-8 gap-8 flex-1 font-(family-name:--font-geist-sans) grid grid-cols-1 md:grid-cols-2">
      {transformedVms.map((vm, i) => (
        <Vm
          {...vm}
          key={i}
          offlineDependencies={
            vm.status === "Degraded" ? getOfflineDependencies(vm) : undefined
          }
        />
      ))}
    </main>
  );
}
