import CpuChart from "@/components/cpuChart";
import DiskChart from "@/components/diskChart";
import MemChart from "@/components/memChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DataReport, VmStatus, VmType } from "@/types/types";
import { directionBiased } from "@dnd-kit/collision";
import { useSortable } from "@dnd-kit/react/sortable";
import dynamic from "next/dynamic";
import { memo, useState } from "react";
import DeleteVmDialog from "./deleteVmDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
const MediaQuery = dynamic(() => import("react-responsive"), {
  ssr: false,
});

interface VmProps extends React.ComponentProps<"div"> {
  id: string;
  name: string;
  status: VmStatus;
  reports: DataReport[];
  offlineDependencies?: VmType[];
  sortingDisabled: boolean;
}

export function SortableVm({
  index,
  sortingDisabled,
  isDragging,
  reports,
  ...vmProps
}: VmProps & { index: number; isDragging: boolean }) {
  const [reportsState, setReportsState] = useState(reports);
  if (reports !== reportsState && sortingDisabled) setReportsState(reports);

  const { ref } = useSortable({
    id: vmProps.id,
    index,
    feedback: "clone",
    disabled: sortingDisabled,
    collisionDetector: directionBiased,
  });
  return (
    <Vm
      reports={reportsState}
      {...vmProps}
      sortingDisabled={sortingDisabled}
      ref={ref}
      className={cn(
        "aria-grabbed:scale-105 aria-grabbed:drop-shadow-2xl aria-hidden:opacity-50",
        {
          '[&:not([aria-hidden="true"])]:animate-scale-pulse cursor-grab':
            !sortingDisabled && !isDragging,
        },
      )}
    />
  );
}

const Vm = memo(function Vm({
  id,
  name,
  status,
  reports,
  offlineDependencies,
  ref,
  className,
  sortingDisabled,
  ...props
}: VmProps) {
  const disabled = status === "Offline";
  return (
    <Card
      className={cn(
        "h-140 md:h-80.5 relative overflow-hidden before:absolute before:inset-0 before:z-20 before:transition-colors before:pointer-events-none transition-all",
        {
          "before:bg-red-900/5 dark:before:bg-red-700/20": status === "Offline",
          "before:inset-0 before:bg-neutral-50/30 before:z-10 before:absolute before:pointer-events-auto":
            !sortingDisabled,
        },
        className,
      )}
      ref={ref}
      {...props}
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
  );
});
