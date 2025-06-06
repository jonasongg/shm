import { DataReport } from "@/types/types";
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
  data: DataReport[];
  className?: string;
}) {
  const { totalMemory, usedMemory, memoryUsagePercent } = data.reduce(
    (acc, d) => (acc.timestamp > d.timestamp ? acc : d),
  );

  return (
    <ChartContainer
      config={{
        totalMemory: {
          label: "Total Memory",
          color: "var(--muted)",
        },
        usedMemory: {
          label: "Used Memory",
          color: "var(--chart-3)",
        },
      }}
      className={className}
    >
      <RadialBarChart
        data={[
          { totalMemory: (+totalMemory - +usedMemory).toFixed(1), usedMemory },
        ]}
        innerRadius="70%"
        outerRadius="150%"
        cy="70%"
        startAngle={180}
        endAngle={0}
      >
        <PolarRadiusAxis
          tick={false}
          tickLine={false}
          axisLine={false}
          type="number"
          dataKey="usedMemory"
          domain={[0, "dataMax"]}
        >
          <Label position="center" dy={-20}>
            {`${usedMemory} / ${totalMemory} GB used`}
          </Label>
          <Label className="font-bold" position="center" dy={16}>
            Memory Usage
          </Label>
        </PolarRadiusAxis>

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              valueFormatter={(value, name) =>
                `${name === "totalMemory" ? totalMemory : value} GB`
              }
            />
          }
        />

        <RadialBar
          dataKey="usedMemory"
          fill="var(--color-usedMemory)"
          stackId="a"
          cornerRadius={4}
          isAnimationActive={false}
        >
          {memoryUsagePercent > 50 && (
            <LabelList
              className="fill-white"
              formatter={() => `${memoryUsagePercent.toFixed(1)}% used`}
              position="insideStart"
            />
          )}
        </RadialBar>
        <RadialBar
          dataKey="totalMemory"
          fill="var(--color-totalMemory)"
          stackId="a"
          cornerRadius={4}
          isAnimationActive={false}
        >
          {memoryUsagePercent <= 50 && (
            <LabelList
              className="fill-gray-500"
              formatter={() => `${(100 - memoryUsagePercent).toFixed(1)}% free`}
              position="insideStart"
            />
          )}
        </RadialBar>
      </RadialBarChart>
    </ChartContainer>
  );
}
