import { Toaster } from "@/components/ui/sonner";
import { toAbsoluteUrl } from "@/lib/utils";
import { RawDataReport, RawVm } from "@/types/types";
import AddVmDialog from "./addVmDialog";
import Body from "./body";

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
  const vmsWithoutReport: Omit<RawVm, "reports">[] = await response.json();

  if (vmsWithoutReport.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xl text-gray-500">
        No active VMs to display
      </div>
    );
  }

  const vms = await Promise.all(
    vmsWithoutReport.map(async (vm) => {
      const response = await fetch(toAbsoluteUrl(`/report/${vm.id}`));
      const reports: RawDataReport[] = await response.json();
      return { ...vm, reports };
    }),
  );

  return (
    <>
      <header className="sticky top-0 z-40 font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      {<Body vms={vms} />}
      <Toaster />
      <AddVmDialog />
    </>
  );
}
