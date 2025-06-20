import { VmType } from "@/types/types";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Settings } from "lucide-react";
import DependencyGraph from "./dependencyGraph";
import { buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function DependencySettingsDialog({ vms }: { vms: VmType[] }) {
  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger
            className={buttonVariants({ variant: "header", size: "icon" })}
          >
            <Settings />
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>Configure VM dependencies</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-7/10">
        <DialogHeader>
          <DialogTitle> Configure VM Dependencies</DialogTitle>
        </DialogHeader>
        <ReactFlowProvider>
          <DependencyGraph vms={vms} />
        </ReactFlowProvider>
      </DialogContent>
    </Dialog>
  );
}
