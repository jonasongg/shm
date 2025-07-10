import { cn } from "@/lib/utils";
import { VmType } from "@/types/types";
import { Shuffle } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import DependencySettingsDialog from "./dependencySettingsDialog";
import { KafkaAlert } from "./kafkaAlert";
import { ModeToggle } from "./modeToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Header({
  displayAlert,
  vms,
  isRearranging,
  setIsRearranging,
}: {
  displayAlert: boolean;
  vms: VmType[] | undefined;
  isRearranging: boolean;
  setIsRearranging: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className="sticky top-0 z-40 font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white dark:bg-neutral-800 p-6 border-b-1 centred-shadow flex transition-colors">
      Dashboard
      <div className="ml-auto flex gap-2">
        {displayAlert && <KafkaAlert />}
        <Tooltip>
          <TooltipContent>
            {isRearranging ? "Stop rearranging VMs" : "Rearrange VMs"}
          </TooltipContent>
          <TooltipTrigger asChild>
            <Button
              variant="header"
              className={cn({
                "bg-muted hover:bg-neutral-200 hover:border-neutral-300 relative before:absolute before:inset-0 before:rounded-md before:animate-ping before:bg-muted before:-z-10":
                  isRearranging,
              })}
              onClick={() => setIsRearranging(!isRearranging)}
              disabled={!vms}
            >
              <Shuffle />
            </Button>
          </TooltipTrigger>
        </Tooltip>
        <DependencySettingsDialog vms={vms} />
        <ModeToggle />
      </div>
    </header>
  );
}
