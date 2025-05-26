import {
  Label,
  LabelList,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer } from "./ui/chart";

export default function MemChart({
  data,
  className,
}: {
  data: DataReportForVm[];
  className?: string;
}) {
  const { totalMemory, freeMemory } = data.reduce((acc, d) =>
    acc.timestamp > d.timestamp ? acc : d,
  );
  const usagePercentage = (freeMemory / totalMemory) * 100;

  return (
    <ChartContainer
      config={{
        totalMemory: {
          label: "Total Memory",
          color: "var(--muted)",
        },
        freeMemory: {
          label: "Free Memory",
          color: "var(--chart-3)",
        },
      }}
      className={className}
    >
      <RadialBarChart
        data={[{ totalMemory, freeMemory }]}
        innerRadius="90%"
        outerRadius="170%"
        cy="75%"
        startAngle={180}
        endAngle={0}
        // margin={{ left: -200, right: -200, top: -200, bottom: -200 }}
      >
        <PolarRadiusAxis
          tick={false}
          tickLine={false}
          axisLine={false}
          type="number"
          dataKey="totalMemory"
        >
          <Label className="" position="center" dy={-32}>
            {`${(freeMemory / 1024 / 1024).toFixed(1)} / ${(totalMemory / 1024 / 1024).toFixed(1)} GB used`}
          </Label>
          <Label className="font-bold" position="center" dy={16}>
            Memory Usage
          </Label>
        </PolarRadiusAxis>
        <RadialBar
          dataKey="freeMemory"
          fill="var(--color-freeMemory)"
          stackId="a"
        >
          <LabelList
            className="fill-white"
            formatter={() => `${usagePercentage.toFixed(1)}%`}
            position="insideStart"
          />
        </RadialBar>
        <RadialBar
          dataKey="totalMemory"
          fill="var(--color-totalMemory)"
          stackId="a"
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
