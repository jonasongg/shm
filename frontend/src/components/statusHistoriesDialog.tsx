import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  cn,
  debounce,
  formatDateDifferentlyIfSameDay,
  toAbsoluteUrl,
} from "@/lib/utils";
import {
  RawSystemStatusHistoryResponse,
  RawVmStatusHistoryResponse,
} from "@/types/types";
import { parse } from "chrono-node";
import { ChartColumn, Check, ChevronDown } from "lucide-react";
import {
  Dispatch,
  memo,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import StatusChart from "./charts/statusChart";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { CardTitle } from "./ui/card";
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

export default memo(
  function StatusHistoriesDialog({
    vmNamesMap,
  }: {
    vmNamesMap: Record<number, string>;
  }) {
    const [vmHistories, setVmHistories] =
      useState<RawVmStatusHistoryResponse[]>();
    const [systemHistories, setSystemHistories] =
      useState<RawSystemStatusHistoryResponse>();
    const [fromDate, setFromDate] = useState<Date>(presetDates[0].from);
    const [untilDate, setUntilDate] = useState<Date>(new Date());
    const [presetValue, setPresetValue] = useState<string | null>(
      presetDates[0].label,
    );
    const [loading, setLoading] = useState<boolean>(false);

    const debouncedFetch = useMemo(
      () =>
        debounce(async (fromDate: Date, untilDate: Date) => {
          try {
            const url = (type: string) =>
              `/statusHistory/${type}?from=${fromDate.toISOString()}${untilDate ? `&until=${untilDate.toISOString()}` : ""}`;
            const vmResponse = await fetch(toAbsoluteUrl(url("vm")));
            const systemResponse = await fetch(toAbsoluteUrl(url("system")));
            if (!vmResponse.ok || !systemResponse.ok) {
              console.error(
                "Failed to fetch status histories:",
                vmResponse.ok
                  ? systemResponse.statusText
                  : vmResponse.statusText,
              );
            } else {
              setVmHistories(await vmResponse.json());
              setSystemHistories(await systemResponse.json());
            }
          } catch (error) {
            console.error("Fetch error:", error);
          } finally {
            setLoading(false);
          }
        }, 100),
      [],
    );

    useEffect(() => {
      setLoading(true);
      debouncedFetch(fromDate, untilDate);
    }, [debouncedFetch, fromDate, untilDate]);

    const transformedVmHistories = vmHistories?.map((history) => ({
      name: vmNamesMap[history.vmId] ?? "",
      histories: history.histories.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      })),
    }));

    const transformedSystemHistories = systemHistories
      ? [
          {
            name: "Kafka Broker",
            histories: systemHistories?.map((h) => ({
              ...h,
              timestamp: new Date(h.timestamp),
            })),
          },
        ]
      : undefined;

    return (
      <Dialog
        onOpenChange={(open) => {
          if (open) {
            setFromDate(presetDates[0].from);
            setUntilDate(new Date());
            setPresetValue(presetDates[0].label);
          }
        }}
      >
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="header">
                <ChartColumn />
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>View Status History</TooltipContent>
        </Tooltip>

        <DialogContent className="sm:max-w-7/10">
          <DialogHeader>
            <DialogTitle>Status History</DialogTitle>
            <DialogDescription>
              View the status of your VMs and the Kafka broker over time.
            </DialogDescription>
          </DialogHeader>

          <div className="h-120 flex flex-col gap-2">
            <div className="flex justify-center gap-4">
              <Label>Filter range:</Label>

              <PresetDatesSelector
                presetValue={presetValue}
                setPresetValue={setPresetValue}
                setFromDate={setFromDate}
                setUntilDate={setUntilDate}
              />

              <Separator orientation="vertical" />

              <Label>Set range:</Label>

              <Label className="font-normal">From</Label>
              <DateTimeSelector
                date={fromDate}
                setDate={(date) => {
                  setPresetValue(null);
                  setFromDate(date);
                }}
                maxDate={new Date(untilDate.valueOf() - 1000)}
              />

              <Label className="font-normal">Until</Label>
              <DateTimeSelector
                date={untilDate}
                setDate={(date) => {
                  setPresetValue(null);
                  setUntilDate(date);
                }}
                maxDate={new Date()}
              />
            </div>

            <CardTitle className="m-2">Kafka Broker</CardTitle>
            {transformedSystemHistories ? (
              <StatusChart
                data={transformedSystemHistories}
                fromDate={fromDate}
                untilDate={untilDate}
                loading={loading}
                simple
              />
            ) : (
              <div className="h-full flex justify-center items-center">
                No Kafka broker history found.
              </div>
            )}

            <CardTitle className="m-2">VMs</CardTitle>
            {transformedVmHistories ? (
              <StatusChart
                data={transformedVmHistories}
                fromDate={fromDate}
                untilDate={untilDate}
                loading={loading}
              />
            ) : (
              <div className="h-full flex justify-center items-center">
                No VM history found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  },
  (prevProps, nextProps) =>
    Object.keys(prevProps).length === Object.keys(nextProps).length,
);

function DateTimeSelector({
  date,
  setDate,
  maxDate,
}: {
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
  maxDate: Date;
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
          setDate(newDate > maxDate ? maxDate : newDate);
        }}
      />
    </div>
  );
}

function PresetDatesSelector({
  setFromDate,
  setUntilDate,
  presetValue,
  setPresetValue,
}: {
  setFromDate: Dispatch<SetStateAction<Date>>;
  setUntilDate: Dispatch<SetStateAction<Date>>;
  presetValue: string | null;
  setPresetValue: Dispatch<SetStateAction<string | null>>;
}) {
  const [open, setOpen] = useState(false);
  const [rawPresetValue, setRawPresetValue] = useState<string>("");
  const [parseResult, setParseResult] = useState<{
    from: Date;
    until: Date;
  } | null>(null);

  const debouncedParse = debounce((value: string) => {
    const result = parse(value);
    if (
      result.length <= 0 ||
      result[0].start.date() > new Date() ||
      (result[0].end && result[0].end.date() > new Date())
    ) {
      setParseResult(null);
      return;
    }
    setParseResult({
      from: result[0].start.date(),
      until: result[0].end?.date() ?? new Date(),
    });
  }, 50);

  let parseDisplayString: string | undefined;
  if (parseResult) {
    const [from, until] = formatDateDifferentlyIfSameDay(
      parseResult.from,
      parseResult.until,
      { timeStyle: "medium" },
      { dateStyle: "medium" },
    );
    parseDisplayString = `${from} \u2013 ${until}`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="bg-white font-normal w-36"
        >
          {presetValue !== null ? presetValue : "Select range"}
          <ChevronDown />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-56">
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
            <CommandGroup className="peer">
              {presetDates.map((preset, index) => (
                <CommandItem
                  key={index}
                  onSelect={(value) => {
                    setFromDate(preset.from);
                    setUntilDate(new Date());
                    setPresetValue(value);
                    setOpen(false);
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
            <CommandSeparator className="peer-[[hidden]]:hidden" alwaysRender />
            <CommandGroup
              forceMount
              className={cn({
                "peer-[:not([hidden])]:hidden": !parseResult, // if (cannot parse and no other options) or can parse
              })}
            >
              <CommandItem
                onSelect={() => {
                  if (parseResult) {
                    setPresetValue("Custom range");
                    setFromDate(parseResult.from);
                    setUntilDate(parseResult.until);
                    setOpen(false);
                  }
                }}
                className="justify-center"
              >
                {parseDisplayString ?? "No valid date range found."}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
