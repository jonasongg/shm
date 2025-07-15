import { cn } from "@/lib/utils";
import { StatusHistoryResponse, SystemStatus, VmStatus } from "@/types/types";
import { Loader2Icon } from "lucide-react";
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import { ScatterPointItem } from "recharts/types/cartesian/Scatter";
import {
  NameType,
  Payload,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const COLOUR_MAP: Record<VmStatus | SystemStatus, string> = {
  Online: "var(--color-green-600)",
  Degraded: "var(--color-amber-600)",
  Offline: "var(--color-red-600)",

  Ok: "var(--color-green-600)",
  KafkaBrokerDown: "var(--color-red-600)",
};

export default function StatusChart({
  data,
  fromDate,
  untilDate,
  loading,
  simple = false,
}: {
  data: StatusHistoryResponse[];
  fromDate: Date;
  untilDate: Date;
  loading: boolean;
  simple?: boolean;
}) {
  const mappedData = data
    .flatMap((d) =>
      d.histories.map((h, i, arr) => ({
        x1: (i === 0 && h.timestamp < fromDate
          ? fromDate
          : h.timestamp
        ).valueOf(),
        x2: (i === arr.length - 1 ? untilDate : arr[i + 1].timestamp).valueOf(),
        status: h.status,
        name: d.name,
      })),
    )
    .sort((a, b) => b.name.localeCompare(a.name))
    .sort((a, b) => a.x1 - b.x1);

  const sameDay = fromDate.getDate() === untilDate.getDate();
  const fullTimeFormat = { dateStyle: "medium", timeStyle: "short" } as const;

  return (
    <div
      className={cn("w-full relative", { "h-full": !simple, "h-1/5": simple })}
    >
      <ChartContainer className="w-full h-full" config={{}}>
        <ScatterChart
          accessibilityLayer
          data={mappedData}
          margin={{ left: -16, bottom: simple ? -28 : -4 }}
        >
          <XAxis
            dataKey="x1"
            type="number"
            tickFormatter={(value: number) =>
              new Date(value).toLocaleString(
                "en-SG",
                sameDay ? { timeStyle: "long" } : fullTimeFormat,
              )
            }
            tickCount={20}
            interval="preserveStartEnd"
            domain={[fromDate.valueOf(), untilDate.valueOf()]}
            tickMargin={8}
            tick={!simple}
          />
          <YAxis
            dataKey="name"
            name="name"
            type="category"
            allowDuplicatedCategory={false}
            tickMargin={8}
            {...(simple && {
              tickFormatter: () => "",
              tickLine: false,
            })}
          />
          <ChartTooltip
            cursor={false}
            content={({ payload, content: _, ...props }) => {
              const rawPayload: (typeof mappedData)[number] | undefined =
                payload?.[0]?.payload;
              if (!rawPayload) return;
              const { status, x1, x2 } = rawPayload;
              const customPayload: Payload<ValueType, NameType>[] = [
                {
                  dataKey: "status",
                  name: "Status",
                  value: status === "KafkaBrokerDown" ? "Down" : status,
                  payload: {
                    fill: COLOUR_MAP[status],
                  },
                },
                {
                  dataKey: "x1",
                  name: `${new Date(x1).toLocaleString("en-SG", fullTimeFormat)} \u2013 ${new Date(x2).toLocaleString("en-SG", fullTimeFormat)}`,
                  payload: { fill: undefined },
                },
              ].filter((x) => !!x);
              return (
                <ChartTooltipContent
                  payload={customPayload}
                  {...props}
                  label={rawPayload?.name}
                  indicator="line"
                />
              );
            }}
          />
          <CartesianGrid />
          <Scatter
            shape={(props: ScatterPointItem) => {
              const payload: (typeof mappedData)[number] = props.payload;
              const height = 30;
              if (
                "xAxis" in props &&
                typeof props.xAxis === "object" &&
                props.xAxis &&
                "scale" in props.xAxis &&
                typeof props.xAxis.scale === "function"
              )
                return (
                  <rect
                    fill={COLOUR_MAP[payload.status]}
                    x={props.cx}
                    y={(props.cy ?? 0) - height / 2}
                    width={
                      props.xAxis.scale(props.payload.x2) -
                      props.xAxis.scale(props.payload.x1)
                    }
                    height={height}
                  />
                );
              else return <></>;
            }}
            isAnimationActive={false}
            className={cn("transition-opacity", { "opacity-20": loading })}
          />
        </ScatterChart>
      </ChartContainer>

      <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center">
        {loading && <Loader2Icon className="animate-spin" />}
      </div>
    </div>
  );
}
