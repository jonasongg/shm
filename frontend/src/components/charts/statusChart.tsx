import { ScatterChart } from "recharts";
import { ChartContainer } from "../ui/chart";

export default function StatusChart() {
  return (
    <ChartContainer config={{}}>
      <ScatterChart></ScatterChart>
    </ChartContainer>
  );
}
