"use client";

import Header from "@/components/header";
import { Vm } from "@/components/vm";
import { GridStackProvider } from "@/lib/gridStackReact/gridStackProvider";
import { bytesFormatter, cn, toAbsoluteUrl } from "@/lib/utils";
import {
  RawDataReport,
  RawVm,
  SystemStatusUpdate,
  VmStatusUpdate,
  VmType,
} from "@/types/types";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const gridStackOptions = { cellHeight: 118, margin: 16 };

export default function Body({ vms: _vms }: { vms: RawVm[] | undefined }) {
  const [vms, setVms] = useState(_vms);
  const [kafkaDown, setKafkaDown] = useState(false);
  const [isRearranging, setIsRearranging] = useState(false);
  const router = useRouter();

  const noData = !_vms;

  useEffect(() => {
    // initiate stream
    const streamEventSource = new EventSource(toAbsoluteUrl("/stream"));

    streamEventSource.addEventListener("Report", (event) => {
      if (noData) router.refresh();
      const dataReport: RawDataReport = JSON.parse(event.data);

      setVms((d) => {
        const vm = d?.find(({ id }) => id === dataReport.vmId);
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
        return d?.map((vm) => (vm.id === dataReport.vmId ? updatedVm : vm));
      });
      setKafkaDown(false);
    });

    streamEventSource.addEventListener("VmStatus", (event) => {
      const { id, status }: VmStatusUpdate = JSON.parse(event.data);
      setVms((d) => d?.map((vm) => (vm.id === id ? { ...vm, status } : vm)));
    });

    streamEventSource.addEventListener("SystemStatus", (event) => {
      const { status }: SystemStatusUpdate = JSON.parse(event.data);
      setKafkaDown(status === "KafkaBrokerDown");
    });

    return () => streamEventSource.close();
  }, [noData, router]);

  useEffect(() => {
    setVms(_vms);
  }, [_vms]);

  useEffect(() => {
    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isRearranging) {
        setIsRearranging(false);
      }
    };

    document.addEventListener("keydown", escapeListener);
    return () => document.removeEventListener("keydown", escapeListener);
  }, [isRearranging]);

  useEffect(() => {
    GridStack.init();
  }, []);

  const transformedVms: VmType[] | undefined = vms?.map((vm) => ({
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

      const dependency = transformedVms?.find((vm) => vm.id === dependencyId);
      if (!dependency) continue;

      dependencies.push(...dependency.dependencyIds);
      if (dependency.status === "Offline") offlineDependencies.push(dependency);
    }

    return offlineDependencies;
  };

  return (
    <>
      <Header
        displayAlert={kafkaDown}
        vms={transformedVms}
        isRearranging={isRearranging}
        setIsRearranging={setIsRearranging}
      />
      {!transformedVms ? (
        <div
          className={cn("h-full flex items-center justify-center text-xl", {
            "text-neutral-500": vms,
            "text-red-600 dark:text-red-300": !vms,
          })}
        >
          {vms
            ? "No active VMs to display"
            : "There was an error fetching VMs. Please try again later."}
        </div>
      ) : (
        <main className="font-(family-name:--font-geist-sans) p-4 h-full">
          <GridStackProvider
            initialOptions={gridStackOptions}
            disabled={!isRearranging}
          >
            {transformedVms.map((vm, i) => {
              const { dependantIds: _, dependencyIds: __, ...props } = vm;
              return (
                <Vm
                  {...props}
                  key={i}
                  offlineDependencies={
                    vm.status === "Degraded"
                      ? getOfflineDependencies(vm)
                      : undefined
                  }
                  sortingDisabled={!isRearranging}
                />
              );
            })}
          </GridStackProvider>
        </main>
      )}
    </>
  );
}
