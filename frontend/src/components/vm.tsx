import CpuChart from "@/components/cpuChart";
import DiskChart from "@/components/diskChart";
import MemChart from "@/components/memChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGridStack } from "@/lib/gridStackReact/useGridStack";
import { cn } from "@/lib/utils";
import { DataReport, VmStatus, VmType } from "@/types/types";
import dynamic from "next/dynamic";
import { memo, useState } from "react";
import DeleteVmDialog from "./deleteVmDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
const MediaQuery = dynamic(() => import("react-responsive"), {
  ssr: false,
});

type VmProps = {
  id: number;
  name: string;
  status: VmStatus;
  reports: DataReport[];
  offlineDependencies?: VmType[];
  sortingDisabled: boolean;
};

export function Vm(props: VmProps) {
  const { reports, sortingDisabled } = props;
  const [reportsState, setReportsState] = useState(reports);
  if (reports !== reportsState && sortingDisabled) setReportsState(reports);

  return <MemoisedVm {...props} reports={reportsState} />;
}

const MemoisedVm = memo(function Vm({
  id,
  name,
  status,
  reports,
  offlineDependencies,
  sortingDisabled,
}: VmProps) {
  const disabled = status === "Offline";
  const { ref } = useGridStack({
    id: id.toString(),
    minH: 3,
    minW: 5,
    w: 6,
    maxH: 6,
    maxW: 12,
  });

  return (
    <div ref={ref}>
      <Card
        className={cn(
          "grid-stack-item-content relative !overflow-hidden before:absolute before:inset-0 before:z-20 before:transition-colors before:pointer-events-none  after:absolute after:inset-0 after:z-20 after:transition-colors after:pointer-events-none transition-all",
          {
            "before:bg-red-900/5 dark:before:bg-red-700/20":
              status === "Offline",
            "after:bg-neutral-50/30 after:pointer-events-auto":
              !sortingDisabled,
          },
        )}
      >
        <CardHeader className="text-xl flex gap-2">
          <CardTitle>{name}</CardTitle>
          <div
            className={cn(
              "ml-4 w-2 h-2 rounded-full self-center transition-colors",
              {
                "bg-red-600": status === "Offline",
                "bg-amber-600": status === "Degraded",
                "bg-green-600": status === "Online",
              },
            )}
          />
          <Tooltip>
            {status === "Degraded" && offlineDependencies && (
              <TooltipContent>
                {`This VM is degraded because these VM(s) are offline:\n${offlineDependencies.map((d) => d.name).join(", ")}`}
              </TooltipContent>
            )}
            <TooltipTrigger className="self-center">
              <Label
                className={cn(
                  "text-xs text-neutral-500 dark:text-neutral-400 self-center",
                  {
                    "border-dotted border-b-2 border-b-neutral-400 dark:border-b-neutral-500":
                      status === "Degraded",
                  },
                )}
              >
                {status}
              </Label>
            </TooltipTrigger>
          </Tooltip>
          <DeleteVmDialog name={name} id={id} />
        </CardHeader>
        {reports.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500">
            No data available for this VM
          </div>
        ) : (
          <CardContent className="flex flex-col h-full">
            <div className="flex flex-col flex-7/8 md:flex-row md:flex-3/4">
              <CpuChart
                id={id}
                data={reports}
                className="flex-1/2 md:flex-2/3"
                disabled={disabled}
              />
              <MediaQuery minWidth={768}>
                <Separator
                  className="my-2 md:my-0 md:mx-2"
                  orientation="vertical"
                />
              </MediaQuery>
              <MediaQuery maxWidth={767}>
                <Separator
                  className="my-2 md:my-0 md:mx-2"
                  orientation="horizontal"
                />
              </MediaQuery>
              <MemChart
                data={reports}
                className="flex-1/2 md:flex-1/3"
                disabled={disabled}
              />
            </div>
            <Separator className="my-2" />
            <DiskChart
              data={reports}
              className="flex-1/8 md:flex-1/4"
              disabled={disabled}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
});
