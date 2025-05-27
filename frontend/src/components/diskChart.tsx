import { cn } from "@/lib/utils";
import { Bar, BarChart, Label, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer } from "./ui/chart";

export default function DiskChart({
  data,
  className,
}: {
  data: DataReportForVm[];
  className?: string;
}) {
  const { totalSpace, freeSpace } = data.reduce((acc, d) =>
    acc.timestamp > d.timestamp ? acc : d,
  );
  const usagePercentage = (freeSpace / totalSpace) * 100;

  const spaceFormatter = (value: number) => (value / 1024 / 1024).toFixed(1);

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
          <YAxis dataKey="timestamp" type="category" hide></YAxis>
          <Bar dataKey="freeSpace" stackId="a" fill="var(--color-freeSpace)">
            <LabelList
              className="fill-white"
              formatter={() => `${usagePercentage.toFixed(1)}%`}
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
        {`${spaceFormatter(freeSpace)} / ${spaceFormatter(totalSpace)} GB used`}
      </span>
    </div>
  );
}
