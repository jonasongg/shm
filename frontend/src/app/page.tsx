import { Toaster } from "@/components/ui/sonner";
import { toAbsoluteUrl } from "@/lib/utils";
import { RawVm } from "@/types/types";
import AddVmDialog from "../components/addVmDialog";
import Body from "./body";

export default async function Page() {
  // initial fetch
  let vms: RawVm[] | undefined = undefined;
  try {
    const response = await fetch(toAbsoluteUrl("/vm"));
    if (!response.ok) {
      console.error("Failed to fetch VMs:", response.statusText);
    } else {
      vms = await response.json();
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }

  return (
    <>
      <Body vms={vms} />
      <Toaster position="bottom-center" />
      <AddVmDialog />
    </>
  );
}
