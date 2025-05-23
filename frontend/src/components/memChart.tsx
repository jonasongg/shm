import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  Label,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { ChartContainer } from "./ui/chart";

export default function MemChart({
  data,
  className,
}: {
  data: DataReportForVm[];
  className?: string;
}) {
  const latestReport = data.reduce((acc, d) =>
    acc.timestamp > d.timestamp ? acc : d,
  );
  const usagePercentage =
    (latestReport.freeMemory / latestReport.totalMemory) * 100;

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
      className={className}
    >
      <BarChart
        accessibilityLayer
        data={[latestReport]}
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
        <Bar dataKey="freeMemory" stackId="a" fill="var(--color-freeMemory)">
          <LabelList
            className="fill-white"
            formatter={(value: number) => `${usagePercentage.toFixed(1)}%`}
          />
        </Bar>
        <Bar dataKey="totalMemory" stackId="a" fill="var(--color-totalMemory)">
          <LabelList
            formatter={(value: number) =>
              `Total: ${(value / 1024 / 1024).toFixed(1)} GB`
            }
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
