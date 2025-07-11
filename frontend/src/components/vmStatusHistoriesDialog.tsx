import { useDebounce } from "@/lib/useDebounce";
import { toAbsoluteUrl } from "@/lib/utils";
import { RawVmStatusHistoryResponse } from "@/types/types";
import { ChartColumn, ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import StatusChart from "./charts/statusChart";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
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

  const debouncedFetch = useDebounce(async () => {
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
  }, 500);

  useEffect(() => {
    debouncedFetch();
  }, [fromDate, untilDate, debouncedFetch]);

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

          <div className="flex justify-center m-4 gap-4">
            <Label>Filter range:</Label>

            <Label className="font-normal">From</Label>
            <DateTimeSelector date={fromDate} setDate={setFromDate} />

            <Label className="font-normal">Until</Label>
            <DateTimeSelector date={untilDate} setDate={setUntilDate} />

            <Separator orientation="vertical" />

            <Label className="font-normal">Custom</Label>
          </div>

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

function DateTimeSelector({
  date,
  setDate,
}: {
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            className="bg-neutral-50 rounded-r-none font-normal"
          >
            {date.toLocaleDateString("en-SG", {
              dateStyle: "medium",
            })}
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) setDate(date);
              setOpen(false);
            }}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        step="1"
        value={date.toLocaleTimeString("en-SG", { hour12: false })}
        className="bg-neutral-50 rounded-l-none border-l-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        onChange={(e) => {
          const time = e.target.value;
          const [hours, minutes, seconds] = time.split(":").map(Number);
          const newDate = new Date(date);
          newDate.setHours(hours, minutes, seconds, 0);
          setDate(newDate.valueOf() > Date.now() ? new Date() : newDate);
        }}
      />
    </div>
  );
}
