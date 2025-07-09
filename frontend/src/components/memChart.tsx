import { cn } from "@/lib/utils";
import { DataReport } from "@/types/types";
import { useState } from "react";
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
  disabled,
}: {
  data: DataReport[];
  className?: string;
  disabled: boolean;
}) {
  const { totalMemory, usedMemory, memoryUsagePercent } = data.reduce(
    (acc, d) => (acc.timestamp > d.timestamp ? acc : d),
  );
  const [ratio, setRatio] = useState<number>(0);

  return (
    <ChartContainer
      config={{
        totalMemory: {
          label: "Total Memory",
          color: "var(--muted)",
        },
        usedMemory: {
          label: "Used Memory",
          color: cn({
            "var(--chart-3)": !disabled,
            "var(--muted-foreground)": disabled,
          }),
        },
      }}
      className={className}
      onResize={(w, h) => setRatio(w / h)}
    >
      <RadialBarChart
        data={[
          { totalMemory: (+totalMemory - +usedMemory).toFixed(1), usedMemory },
        ]}
        innerRadius={`${53 * Math.min(Math.max(ratio, 1), 1.3)}%`}
        outerRadius={`${115 * Math.min(Math.max(ratio, 1), 1.3)}%`}
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
              className="fill-neutral-500"
              formatter={() => `${(100 - memoryUsagePercent).toFixed(1)}% free`}
              position="insideStart"
            />
          )}
        </RadialBar>
      </RadialBarChart>
    </ChartContainer>
  );
}
