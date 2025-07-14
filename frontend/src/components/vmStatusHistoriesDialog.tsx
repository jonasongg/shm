import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/lib/useDebounce";
import { cn, toAbsoluteUrl } from "@/lib/utils";
import { RawVmStatusHistoryResponse } from "@/types/types";
import { parse } from "chrono-node";
import { ChartColumn, Check, ChevronDown } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  const [presetPopoverOpen, setPresetPopoverOpen] = useState(false);
  const [presetValue, setPresetValue] = useState<string | null>(null);
  const [rawPresetValue, setRawPresetValue] = useState<string>("");
  const [parseResult, setParseResult] = useState<{
    from: Date;
    until: Date;
  } | null>(null);

  const presetDates = [
    {
      label: "Last hour",
      from: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      label: "Last 24 hours",
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      label: "Last 7 days",
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      label: "Last 30 days",
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ];

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

  const debouncedParse = useDebounce((value: string) => {
    const result = parse(value);
    if (result.length <= 0 || result[0].start.date().valueOf() > Date.now()) {
      setParseResult(null);
      return;
    }
    setParseResult({
      from: result[0].start.date(),
      until: result[0].end?.date() ?? new Date(),
    });
  }, 50);

  useEffect(() => {
    debouncedFetch();
  }, [fromDate, untilDate, debouncedFetch]);

  const submitCustomRange = useCallback(() => {
    if (parseResult) {
      setPresetValue("Custom range");
      setFromDate(parseResult.from);
      setUntilDate(parseResult.until);
      setPresetPopoverOpen(false);
    }
  }, [parseResult]);

  useEffect(() => {
    const enterListener = (event: KeyboardEvent) => {
      if (event.key === "Enter") submitCustomRange();
    };
    document.addEventListener("keydown", enterListener);
    return () => document.removeEventListener("keydown", enterListener);
  }, [submitCustomRange]);

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

            <Popover
              open={presetPopoverOpen}
              onOpenChange={setPresetPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={presetPopoverOpen}
                  className="bg-white font-normal"
                >
                  {presetValue !== null ? presetValue : "Select range"}
                  <ChevronDown />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Type a custom range..."
                    value={rawPresetValue}
                    onValueChange={(value) => {
                      setRawPresetValue(value);
                      debouncedParse(value);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty
                      className={cn(
                        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 m-1 text-sm outline-hidden select-none justify-center",
                        {
                          "bg-accent text-accent-foreground": parseResult,
                        },
                      )}
                      onClick={() => submitCustomRange()}
                    >
                      {parseResult
                        ? `${parseResult.from.toLocaleDateString("en-SG", {
                            dateStyle: "medium",
                          })} – ${parseResult.until.toLocaleDateString(
                            "en-SG",
                            {
                              dateStyle: "medium",
                            },
                          )}`
                        : "No valid date range found"}
                    </CommandEmpty>
                    <CommandGroup>
                      {presetDates.map((preset, index) => (
                        <CommandItem
                          key={index}
                          value={preset.label}
                          onSelect={(value) => {
                            setFromDate(preset.from);
                            setUntilDate(new Date());
                            setPresetValue(value);
                            setPresetPopoverOpen(false);
                          }}
                        >
                          {preset.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              presetValue === preset.label
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" />

            <Label>Set range:</Label>

            <Label className="font-normal">From</Label>
            <DateTimeSelector date={fromDate} setDate={setFromDate} />

            <Label className="font-normal">Until</Label>
            <DateTimeSelector date={untilDate} setDate={setUntilDate} />
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
            className="bg-white rounded-r-none font-normal"
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
        className="bg-white rounded-l-none border-l-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
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
