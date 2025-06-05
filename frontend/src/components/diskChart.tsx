import { cn, numberFormatter } from "@/lib/utils";
import { DataReport } from "@/types/types";
import { Bar, BarChart, Label, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

export default function DiskChart({
  data,
  className,
}: {
  data: DataReport[];
  className?: string;
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
            color: "var(--chart-2)",
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
            <Label className="font-bold" position="bottom" offset={-24}>
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
          >
            {spaceUsagePercent <= 50 && (
              <LabelList
                className="fill-gray-500"
                formatter={() =>
                  `${(100 - spaceUsagePercent).toFixed(1)}% free`
                }
              />
            )}
          </Bar>
        </BarChart>
      </ChartContainer>

      <span className="text-xs text-gray-500 whitespace-nowrap mb-5 self-center cursor-default">
        {`${numberFormatter(+usedSpace)} / ${numberFormatter(+totalSpace)} GB used`}
      </span>
    </div>
  );
}
