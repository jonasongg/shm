import { AreaChart, CartesianGrid, XAxis, YAxis, Area } from "recharts";
import { ChartContainer } from "./ui/chart";

export default function CpuChart({
  data,
}: {
  data: DataReportForVm[] | undefined;
}) {
  console.log(data?.map(({ cpuUsagePercent: x }) => x));
  return (
    <ChartContainer
      config={{
        cpu: {
          label: "CPU",
          color: "var(--chart-1)",
        },
      }}
      className="min-h-[200px] w-full"
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: -20, right: 12 }}
      >
        <defs>
          <linearGradient id="cpuUsagePercent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cpu)" stopOpacity={0.7} />
            <stop offset="95%" stopColor="var(--color-cpu)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) =>
            Math.floor(
              (new Date().valueOf() - value.valueOf()) / 1000,
            ).toString()
          }
          reversed
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <Area
          dataKey="cpuUsagePercent"
          type="bump"
          fill="url(#cpuUsagePercent)"
          stroke="var(--color-cpu)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
