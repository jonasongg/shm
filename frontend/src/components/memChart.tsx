import {
  Label,
  LabelList,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

export default function MemChart({
  data,
  className,
}: {
  data: DataReportForVm[];
  className?: string;
}) {
  const { totalMemory, freeMemory, memoryUsagePercent } = data.reduce(
    (acc, d) => (acc.timestamp > d.timestamp ? acc : d),
  );

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
        innerRadius="70%"
        outerRadius="150%"
        cy="75%"
        startAngle={180}
        endAngle={0}
        // margin={{ left: -40, right: -40, top: -40, bottom: -40 }}
      >
        <PolarRadiusAxis
          tick={false}
          tickLine={false}
          axisLine={false}
          type="number"
          dataKey="totalMemory"
        >
          <Label position="center" dy={-20}>
            {`${freeMemory} / ${totalMemory} GB used`}
          </Label>
          <Label className="font-bold" position="center" dy={16}>
            Memory Usage
          </Label>
        </PolarRadiusAxis>

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              valueFormatter={(value) => `${value} GB`}
              hideLabel
            />
          }
        />

        <RadialBar
          dataKey="freeMemory"
          fill="var(--color-freeMemory)"
          stackId="a"
          cornerRadius={4}
        >
          <LabelList
            className="fill-white"
            formatter={() => `${memoryUsagePercent.toFixed(1)}%`}
            position="insideStart"
          />
        </RadialBar>
        <RadialBar
          dataKey="totalMemory"
          fill="var(--color-totalMemory)"
          stackId="a"
          cornerRadius={4}
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
