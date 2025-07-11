import { toAbsoluteUrl } from "@/lib/utils";
import { RawVmStatusHistoryResponse } from "@/types/types";
import { ChartColumn } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function VmStatusHistoriesDialog() {
  const [histories, setHistories] = useState<RawVmStatusHistoryResponse[]>();
  const [fromDate, setFromDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.setHours(now.getHours() - 1));
  });
  const [untilDate, setUntilDate] = useState<Date>();

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

  console.log(histories);

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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>VM Status History</DialogTitle>
          <DialogDescription>
            View the status of your VMs over time.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
