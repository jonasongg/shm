import { Toaster } from "@/components/ui/sonner";
import { toAbsoluteUrl } from "@/lib/utils";
import { RawDataReport, RawVm } from "@/types/types";
import Body from "./body";
import VmDialog from "./vmDialog";

export default async function Page() {
  // initial fetch
  // const response = await fetch(toAbsoluteUrl("/report"));
  // if (!response.ok) {
  //   throw new Error("Failed to fetch data");
  // }

  // const data: RawDataReport[] = await response.json();
  const response = await fetch(toAbsoluteUrl("/vm"));
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const vms: RawVm[] = await response.json();

  if (vms.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xl text-gray-500">
        No active VMs to display
      </div>
    );
  }

  const data: Record<string, RawDataReport[]> = {};
  for await (const { id, name } of vms) {
    const response = await fetch(toAbsoluteUrl(`/report/${id}`));
    const reports: RawDataReport[] = await response.json();
    data[name] = reports;
  }

  return (
    <>
      <header className="sticky top-0 z-99 font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      {<Body data={data} />}
      <Toaster />
      <VmDialog />
    </>
  );
}
