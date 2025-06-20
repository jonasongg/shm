import { toAbsoluteUrl } from "@/lib/utils";
import { VmType } from "@/types/types";
import {
  Edge,
  MarkerType,
  ReactFlowProvider,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DependencyGraph from "./dependencyGraph";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form } from "./ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DependenciesPutType = Record<number, number[]>;

export const baseEdge = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  animated: true,
  type: "deletableEdge",
};
export default function DependencySettingsDialog({ vms }: { vms: VmType[] }) {
  const [dependenciesDirty, setDependenciesDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const initialEdges = vms.flatMap((vm) =>
    vm.dependantIds.map<Edge>((depId) => ({
      ...baseEdge,
      id: `${vm.id}-${depId}`,
      source: vm.id.toString(),
      target: depId.toString(),
    })),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const form = useForm();

  const onSubmit = async () => {
    const values = edges.reduce((acc, { source, target }) => {
      const t = acc[+source];
      return {
        ...acc,
        [source]: [...(acc[+source] ?? []), target],
      };
    }, {} as DependenciesPutType);
    try {
      const response = await fetch(toAbsoluteUrl("/vm/dependencies"), {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setOpen(false);
        toast(`Updated VM dependencies successfully!`);
        // update vm list
        router.refresh();
      } else {
        form.setError("name", {
          message:
            (await response.json()) ||
            "Failed to update dependencies. Please try again.",
        });
      }
    } catch (e) {
      toast("There was an error in connecting to the server.");
      console.error(e);
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setDependenciesDirty(false);
      }}
    >
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
          <DependencyGraph
            vms={vms}
            setDependenciesDirty={setDependenciesDirty}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
          />
        </ReactFlowProvider>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogFooter>
              <Button disabled={!dependenciesDirty} type="submit">
                Save Changes
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Discard Changes</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
