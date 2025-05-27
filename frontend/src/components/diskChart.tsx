import { cn } from "@/lib/utils";
import { Bar, BarChart, Label, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

export default function DiskChart({
  data,
  className,
}: {
  data: DataReportForVm[];
  className?: string;
}) {
  const { totalSpace, freeSpace, spaceUsagePercent } = data.reduce((acc, d) =>
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
          freeSpace: {
            label: "Free Disk Space",
            color: "var(--chart-2)",
          },
        }}
        className="w-full"
      >
        <BarChart
          accessibilityLayer
          data={[{ totalSpace, freeSpace }]}
          layout="vertical"
          margin={{ bottom: -10, left: 8, right: 10 }}
        >
          <XAxis
            tick={false}
            dataKey="totalSpace"
            type="number"
            tickLine={false}
            axisLine={false}
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
                valueFormatter={(value) => `${value} GB`}
                hideLabel
              />
            }
          />

          <Bar dataKey="freeSpace" stackId="a" fill="var(--color-freeSpace)">
            <LabelList
              className="fill-white"
              formatter={() => `${spaceUsagePercent.toFixed(1)}%`}
            />
          </Bar>
          <Bar
            dataKey="totalSpace"
            stackId="a"
            fill="var(--color-totalSpace)"
          ></Bar>
        </BarChart>
      </ChartContainer>

      <span className="text-xs text-gray-500 whitespace-nowrap mb-5 self-center cursor-default">
        {`${freeSpace} / ${totalSpace} GB used`}
      </span>
    </div>
  );
}
