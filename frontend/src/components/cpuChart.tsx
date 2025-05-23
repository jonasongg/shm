import { AreaChart, CartesianGrid, XAxis, YAxis, Area, Label } from "recharts";
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
      className="h-full"
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 0, right: 12, bottom: 20 }}
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
          tickFormatter={(value) => `${value}%`}
          padding={{}}
        >
          <Label
            className="font-bold"
            angle={-90}
            position="left"
            style={{ textAnchor: "middle" }}
            offset={-10}
          >
            CPU Usage
          </Label>
        </YAxis>
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
