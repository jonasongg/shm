import { cn, numberFormatter } from "@/lib/utils";
import { DataReport } from "@/types/types";
import { Area, AreaChart, CartesianGrid, Label, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

export default function CpuChart({
  id,
  data,
  className,
  disabled,
}: {
  id: number;
  data: DataReport[];
  className?: string;
  disabled: boolean;
}) {
  return (
    <ChartContainer
      config={{
        cpuUsagePercent: {
          label: "CPU Usage",
          color: cn({
            "var(--chart-1)": !disabled,
            "var(--muted-foreground)": disabled,
          }),
        },
      }}
      className={className}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ right: 12, bottom: 12 }}
      >
        <defs>
          <linearGradient
            id={`cpuUsagePercent${id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-cpuUsagePercent)"
              stopOpacity={0.7}
            />
            <stop
              offset="95%"
              stopColor="var(--color-cpuUsagePercent)"
              stopOpacity={0.2}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(value: Date) =>
            `${Math.floor((new Date().valueOf() - value.valueOf()) / 1000)}s`
          }
          reversed
          hide={disabled}
        >
          <Label className="font-bold" offset={0} position="bottom">
            Seconds Ago
          </Label>
        </XAxis>
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(value: number) => `${numberFormatter(+value)}%`}
        >
          <Label
            className="font-bold"
            angle={-90}
            position="left"
            style={{ textAnchor: "middle" }}
            offset={-8}
          >
            CPU Usage
          </Label>
        </YAxis>

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              valueFormatter={(value) => `${(+value).toFixed(1)}%`}
              hideLabel
            />
          }
        />

        <Area
          dataKey="cpuUsagePercent"
          type="bump"
          fill={`url(#cpuUsagePercent${id})`}
          stroke="var(--color-cpuUsagePercent)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
