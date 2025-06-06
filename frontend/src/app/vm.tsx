import CpuChart from "@/components/cpuChart";
import DiskChart from "@/components/diskChart";
import MemChart from "@/components/memChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DataReport } from "@/types/types";
import dynamic from "next/dynamic";
import DeleteVmDialog from "./deleteVmDialog";
const MediaQuery = dynamic(() => import("react-responsive"), {
  ssr: false,
});

export default function Vm({
  name,
  vmId,
  reports,
}: {
  name: string;
  vmId: number;
  reports: DataReport[];
}) {
  return (
    <Card className="h-140 md:h-81">
      <CardHeader className="text-xl flex justify-between">
        <CardTitle>{name}</CardTitle>
        <DeleteVmDialog name={name} vmId={vmId} />
      </CardHeader>
      {reports.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available for this VM
        </div>
      ) : (
        <CardContent className="flex flex-col h-full">
          <div className="flex flex-col flex-7/8 md:flex-row md:flex-3/4">
            <CpuChart data={reports} className="flex-1/2 md:flex-2/3" />
            <MediaQuery minWidth={768}>
              <Separator
                className="my-2 md:my-0 md:mx-2"
                orientation="vertical"
              />
            </MediaQuery>
            <MediaQuery maxWidth={767}>
              <Separator
                className="my-2 md:my-0 md:mx-2"
                orientation="horizontal"
              />
            </MediaQuery>
            <MemChart data={reports} className="flex-1/2 md:flex-1/3" />
          </div>
          <Separator className="my-2" />
          <DiskChart data={reports} className="flex-1/8 md:flex-1/4" />
        </CardContent>
      )}
    </Card>
  );
}
