import { ModeToggle } from "@/components/modeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, toAbsoluteUrl } from "@/lib/utils";
import { RawDataReport, RawVm } from "@/types/types";
import { Settings } from "lucide-react";
import AddVmDialog from "../components/addVmDialog";
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
      <header className="sticky top-0 z-40 font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white dark:bg-neutral-800 p-6 border-b-1 centred-shadow flex transition-colors">
        Dashboard
        <div className="ml-auto flex gap-2">
          <Tooltip>
            <TooltipTrigger
              className={buttonVariants({ variant: "header", size: "icon" })}
            >
              <Settings />
            </TooltipTrigger>
            <TooltipContent>Configure VM dependencies</TooltipContent>
          </Tooltip>
          <ModeToggle />
        </div>
      </header>
      {!vms || vms.length === 0 ? (
        <div
          className={cn("h-full flex items-center justify-center text-xl", {
            "text-neutral-500": vms,
            "text-red-600 dark:text-red-300": !vms,
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
