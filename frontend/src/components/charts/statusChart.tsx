import { VmStatusHistoryResponse } from "@/types/types";
import { Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import { ScatterPointItem } from "recharts/types/cartesian/Scatter";
import {
  NameType,
  Payload,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const COLOUR_MAP = {
  Online: "var(--color-green-600)",
  Degraded: "var(--color-amber-600)",
  Offline: "var(--color-red-600)",
};

export default function StatusChart({
  data,
  fromDate,
  untilDate,
}: {
  data: VmStatusHistoryResponse[];
  fromDate: Date;
  untilDate: Date;
}) {
  const mappedData = data
    .flatMap((d) =>
      d.histories.map((h, i, arr) => ({
        x1: (i === 0 ? fromDate : h.timestamp).valueOf(),
        x2: (i === arr.length - 1 ? untilDate : arr[i + 1].timestamp).valueOf(),
        status: h.status,
        vmName: d.vmName,
      })),
    )
    .sort((a, b) => b.vmName.localeCompare(a.vmName))
    .sort((a, b) => a.x1 - b.x1);

  const sameDay = fromDate.getDate() === untilDate.getDate();
  const fullTimeFormat = { dateStyle: "medium", timeStyle: "short" } as const;

  return (
    <ChartContainer className="w-full h-full" config={{}}>
      <ScatterChart accessibilityLayer data={mappedData}>
        <XAxis
          dataKey="x1"
          type="number"
          tickFormatter={(value: number) =>
            new Date(value).toLocaleString(
              "en-SG",
              sameDay ? { timeStyle: "long" } : fullTimeFormat,
            )
          }
          tickCount={8}
          domain={[fromDate.valueOf(), untilDate.valueOf()]}
        />

        <YAxis
          dataKey="vmName"
          name="VM Name"
          type="category"
          allowDuplicatedCategory={false}
        />

        <ChartTooltip
          cursor={false}
          content={({ payload, content: _, ...props }) => {
            const rawPayload: (typeof mappedData)[number] | undefined =
              payload?.[0]?.payload;
            if (!rawPayload) return;

            const customPayload: Payload<ValueType, NameType>[] = [
              {
                dataKey: "status",
                name: "Status",
                value: rawPayload.status,
                payload: {
                  fill: rawPayload ? COLOUR_MAP[rawPayload.status] : undefined,
                },
              },
              {
                dataKey: "x1",
                name: `${new Date(rawPayload.x1).toLocaleString("en-SG", fullTimeFormat)} – ${new Date(rawPayload.x2).toLocaleString("en-SG", fullTimeFormat)}`,
                payload: { fill: undefined },
              },
            ].filter((x) => !!x);
            console.log(props);
            return (
              <ChartTooltipContent
                payload={customPayload}
                {...props}
                label={rawPayload?.vmName}
                indicator="line"
              />
            );
          }}
        />

        <Scatter
          shape={(props: ScatterPointItem) => {
            const payload: (typeof mappedData)[number] = props.payload;
            const height = 20;
            if (
              "xAxis" in props &&
              typeof props.xAxis === "object" &&
              props.xAxis &&
              "scale" in props.xAxis &&
              typeof props.xAxis.scale === "function"
            )
              return (
                <rect
                  fill={COLOUR_MAP[payload.status]}
                  x={props.cx}
                  y={(props.cy ?? 0) - height / 2}
                  width={
                    props.xAxis.scale(props.payload.x2) -
                    props.xAxis.scale(props.payload.x1)
                  }
                  height={height}
                />
              );
            else return <></>;
          }}
        />
      </ScatterChart>
    </ChartContainer>
  );
}
