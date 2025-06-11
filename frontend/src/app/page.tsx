import { Toaster } from "@/components/ui/sonner";
import { cn, toAbsoluteUrl } from "@/lib/utils";
import { RawDataReport, RawVm } from "@/types/types";
import AddVmDialog from "./addVmDialog";
import Body from "./body";

export default async function Page() {
  // initial fetch
  let vms: RawVm[] | undefined = undefined;
  try {
    const response = await fetch(toAbsoluteUrl("/vm"), { cache: "no-store" });
    if (!response.ok) {
      console.error("Failed to fetch VMs:", response.statusText);
    } else {
      const vmsWithoutReport: Omit<RawVm, "reports">[] = await response.json();

      vms = await Promise.all(
        vmsWithoutReport.map(async (vm) => {
          const response = await fetch(toAbsoluteUrl(`/report/${vm.id}`));
          const reports: RawDataReport[] = await response.json();
          return { ...vm, reports };
        }),
      );
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }

  return (
    <>
      <header className="sticky top-0 z-40 font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white p-6 border-b-1 centred-shadow">
        Dashboard
      </header>
      {!vms || vms.length === 0 ? (
        <div
          className={cn("h-full flex items-center justify-center text-xl", {
            "text-gray-500": vms,
            "text-red-600": !vms,
          })}
        >
          {vms
            ? "No active VMs to display"
            : "There was an error fetching VMs. Please try again later."}
        </div>
      ) : (
        <Body vms={vms} key={vms.length} />
      )}
      <Toaster position="bottom-center" />
      <AddVmDialog />
    </>
  );
}
