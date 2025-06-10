import CpuChart from "@/components/cpuChart";
import DiskChart from "@/components/diskChart";
import MemChart from "@/components/memChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DataReport, VmStatus } from "@/types/types";
import dynamic from "next/dynamic";
import DeleteVmDialog from "./deleteVmDialog";
const MediaQuery = dynamic(() => import("react-responsive"), {
  ssr: false,
});

export default function Vm({
  name,
  id,
  status,
  reports,
}: {
  name: string;
  id: number;
  status: VmStatus;
  reports: DataReport[];
}) {
  return (
    <Card className="h-140 md:h-81">
      <CardHeader className="text-xl flex">
        <CardTitle>{name}</CardTitle>
        <div
          className={cn(
            "ml-4 w-2 h-2 rounded-full self-center transition-colors",
            {
              "bg-red-600": status === "Offline",
              "bg-green-600": status === "Online",
            },
          )}
        />
        <Label className="text-xs text-gray-500 self-center">{status}</Label>
        <DeleteVmDialog name={name} id={id} />
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
