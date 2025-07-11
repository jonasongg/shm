import { toAbsoluteUrl } from "@/lib/utils";
import { VmType } from "@/types/types";
import {
  Edge,
  MarkerType,
  ReactFlowProvider,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2Icon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DependencyGraph from "./dependencyGraph";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
export default function DependencySettingsDialog({
  vms,
}: {
  vms: VmType[] | undefined;
}) {
  const [dependenciesDirty, setDependenciesDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const initialEdges =
    vms?.flatMap((vm) =>
      vm.dependantIds.map<Edge>((depId) => ({
        ...baseEdge,
        id: `${vm.id}-${depId}`,
        source: vm.id.toString(),
        target: depId.toString(),
      })),
    ) ?? [];
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const form = useForm();
  const errors = form.formState.errors.root;

  const onSubmit = async () => {
    const values = edges.reduce(
      (acc, { source, target }) => ({
        ...acc,
        [source]: [...(acc[+source] ?? []), target],
      }),
      {} as DependenciesPutType,
    );
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
        form.setError("root.serverError", {
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
        setEdges(initialEdges);
        form.clearErrors();
      }}
    >
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="header" disabled={!vms}>
              <Settings />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>Configure VM dependencies</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-7/10">
        <DialogHeader>
          <DialogTitle>Configure VM Dependencies</DialogTitle>
          <DialogDescription>
            You can drag and drop to configure dependencies for VMs.
          </DialogDescription>
        </DialogHeader>

        <ReactFlowProvider>
          <DependencyGraph
            vms={vms ?? []}
            setDependenciesDirty={setDependenciesDirty}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              form.clearErrors();
            }}
            error={!!errors}
          />
        </ReactFlowProvider>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogFooter>
              {errors && "serverError" in errors && (
                <p className="text-sm self-center mr-3 text-destructive">
                  {errors.serverError.message}
                </p>
              )}
              {form.formState.isSubmitting ? (
                <Button type="submit" disabled>
                  <Loader2Icon className="animate-spin" /> Saving Changes...
                </Button>
              ) : (
                <Button disabled={!dependenciesDirty} type="submit">
                  Save Changes
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={form.formState.isSubmitting || !dependenciesDirty}
                >
                  Discard Changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
