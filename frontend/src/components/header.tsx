import { Settings } from "lucide-react";
import { KafkaAlert } from "./kafkaAlert";
import { ModeToggle } from "./modeToggle";
import { buttonVariants } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Header({ displayAlert }: { displayAlert: boolean }) {
  return (
    <header className="sticky top-0 z-40 font-(family-name:--font-geist-sans) text-2xl font-extrabold bg-white dark:bg-neutral-800 p-6 border-b-1 centred-shadow flex transition-colors">
      Dashboard
      <div className="ml-auto flex gap-2">
        {displayAlert && <KafkaAlert />}
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
  );
}
