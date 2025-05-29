import { Area, AreaChart, CartesianGrid, Label, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

export default function CpuChart({
  data,
  className,
}: {
  data: DataReport[];
  className?: string;
}) {
  return (
    <ChartContainer
      config={{
        cpuUsagePercent: {
          label: "CPU Usage",
          color: "var(--chart-1)",
        },
      }}
      className={className}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 8, right: 12, bottom: 20 }}
      >
        <defs>
          <linearGradient id="cpuUsagePercent" x1="0" y1="0" x2="0" y2="1">
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
          tickMargin={8}
          tickFormatter={(value) =>
            `${Math.floor((new Date().valueOf() - value.valueOf()) / 1000)}s`
          }
          reversed
        >
          <Label className="font-bold" offset={8} position="bottom">
            Seconds Ago
          </Label>
        </XAxis>
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value: number) => `${value.toFixed(1)}%`}
        >
          <Label
            className="font-bold"
            angle={-90}
            position="left"
            style={{ textAnchor: "middle" }}
            offset={-4}
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
          fill="url(#cpuUsagePercent)"
          stroke="var(--color-cpuUsagePercent)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
