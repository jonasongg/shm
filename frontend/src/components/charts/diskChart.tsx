import { cn, numberFormatter } from "@/lib/utils";
import { DataReport } from "@/types/types";
import { Bar, BarChart, Label, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

export default function DiskChart({
  data,
  className,
  disabled,
}: {
  data: DataReport[];
  className?: string;
  disabled: boolean;
}) {
  const { totalSpace, usedSpace, spaceUsagePercent } = data.reduce((acc, d) =>
    acc.timestamp > d.timestamp ? acc : d,
  );

  return (
    <div className={cn(className, "flex")}>
      <ChartContainer
        config={{
          totalSpace: {
            label: "Total Disk Space",
            color: "var(--muted)",
          },
          usedSpace: {
            label: "Used Disk Space",
            color: cn({
              "var(--chart-2)": !disabled,
              "var(--muted-foreground)": disabled,
            }),
          },
        }}
        className="w-full"
      >
        <BarChart
          accessibilityLayer
          data={[{ totalSpace, usedSpace }]}
          layout="vertical"
          margin={{ bottom: -10, left: 8, right: 10 }}
        >
          <XAxis
            tick={false}
            tickLine={false}
            axisLine={false}
            type="number"
            dataKey="totalSpace"
            domain={[0, "dataMax"]}
          >
            <Label className="font-bold" position="bottom" offset={-22}>
              Disk Space Usage
            </Label>
          </XAxis>
          <YAxis dataKey="timestamp" type="category" hide />

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                valueFormatter={(value) => `${numberFormatter(+value)} GB`}
                hideLabel
              />
            }
          />

          <Bar
            dataKey="usedSpace"
            stackId="a"
            fill="var(--color-usedSpace)"
            radius={[4, 0, 0, 4]}
            isAnimationActive={false}
          >
            {spaceUsagePercent > 50 && (
              <LabelList
                className="fill-white"
                formatter={() => `${spaceUsagePercent.toFixed(1)}% used`}
              />
            )}
          </Bar>
          <Bar
            dataKey="totalSpace"
            stackId="a"
            fill="var(--color-totalSpace)"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            {spaceUsagePercent <= 50 && (
              <LabelList
                className="fill-neutral-500"
                formatter={() =>
                  `${(100 - spaceUsagePercent).toFixed(1)}% free`
                }
              />
            )}
          </Bar>
        </BarChart>
      </ChartContainer>

      <span className="text-xs text-neutral-500 whitespace-nowrap mb-5 self-center cursor-default">
        {`${numberFormatter(+usedSpace)} / ${numberFormatter(+totalSpace)} GB used`}
      </span>
    </div>
  );
}
