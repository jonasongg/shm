import { toAbsoluteUrl } from "@/lib/utils";
import { RawVmStatusHistoryResponse } from "@/types/types";
import { ChartColumn } from "lucide-react";
import { useEffect, useState } from "react";
import StatusChart from "./charts/statusChart";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function VmStatusHistoriesDialog({
  vmNamesMap,
}: {
  vmNamesMap: Record<number, string>;
}) {
  const [histories, setHistories] = useState<RawVmStatusHistoryResponse[]>();
  const [fromDate, setFromDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.setDate(now.getDate() - 2));
  });
  const [untilDate, setUntilDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      try {
        const url = `/vm/histories?from=${fromDate.toISOString()}${untilDate ? `&until=${untilDate.toISOString()}` : ""}`;
        const response = await fetch(toAbsoluteUrl(url));
        if (!response.ok) {
          console.error(
            "Failed to fetch VM status histories:",
            response.statusText,
          );
        } else {
          setHistories(await response.json());
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    })();
  }, [fromDate, untilDate]);

  const transformedHistories = histories?.map((history) => ({
    vmName: vmNamesMap[history.vmId] ?? "",
    histories: history.histories.map((h) => ({
      ...h,
      timestamp: new Date(h.timestamp),
    })),
  }));

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="header">
              <ChartColumn />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>View VM Status History</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-7/10 sm:h-4/5">
        <DialogHeader>
          <DialogTitle>VM Status History</DialogTitle>
          <DialogDescription>
            View the status of your VMs over time.
          </DialogDescription>

          {transformedHistories && (
            <StatusChart
              data={transformedHistories}
              fromDate={fromDate}
              untilDate={untilDate}
            />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
