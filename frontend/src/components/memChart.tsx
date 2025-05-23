import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  Label,
  BarChart,
  Bar,
} from "recharts";
import { ChartContainer } from "./ui/chart";

export default function MemChart({ data }: { data: DataReportForVm[] }) {
  return (
    <ChartContainer
      config={{
        totalMemory: {
          label: "Total Memory",
          color: "#e9e9e9",
        },
        freeMemory: {
          label: "Free Memory",
          color: "var(--chart-2)",
        },
      }}
      className="flex-1/3"
    >
      <BarChart
        accessibilityLayer
        data={[
          data.reduce((acc, d) => (acc.timestamp > d.timestamp ? acc : d)),
        ]}
        layout="vertical"
        margin={{ bottom: -10, left: 8, right: 8 }}
      >
        <XAxis
          dataKey="totalMemory"
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={() => ""}
        >
          <Label className="font-bold" position="bottom" offset={-24}>
            Memory Usage
          </Label>
        </XAxis>
        <YAxis dataKey="timestamp" type="category" hide />
        <Bar dataKey="freeMemory" stackId="a" fill="var(--color-freeMemory)" />
        <Bar
          dataKey="totalMemory"
          stackId="a"
          fill="var(--color-totalMemory)"
        />
      </BarChart>
    </ChartContainer>
  );
}
