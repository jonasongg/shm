"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { toAbsoluteUrl } from "@/lib/utils";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteVmDialog({
  name,
  vmId,
}: {
  name: string;
  vmId: number;
}) {
  const router = useRouter();

  const handleSubmit = async (isReportOnly: boolean) => {
    try {
      const response = await fetch(
        toAbsoluteUrl(`/vm/${vmId}${isReportOnly ? "/reports" : ""}`),
        { method: "DELETE" },
      );
      if (response.ok) {
        toast(
          `VM ${name}${isReportOnly ? "'s reports" : ""} deleted successfully!`,
        );
        // update vm list
        router.refresh();
      } else {
        toast("There was an error in deleting the VM.");
      }
    } catch (e) {
      toast("There was an error in deleting the VM.");
      console.error(e);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="cursor-pointer mb-[-16px]"
          variant="secondary"
          size="icon"
        >
          <Trash color="red" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Are you sure you want to delete "${name}"?`}</AlertDialogTitle>
          <AlertDialogDescription>
            You can either delete this VM or delete the reports associated with
            this VM.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-destructive/20 hover:bg-destructive/30 text-destructive/80"
            onClick={() => handleSubmit(true)}
          >
            {"Delete VM's reports"}
          </AlertDialogAction>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => handleSubmit(false)}
          >
            Delete VM
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* {form.formState.isSubmitting ? (
                <Button type="submit" disabled>
                  <Loader2Icon className="animate-spin" /> Adding...
                </Button>
              ) : (
                <Button type="submit">Add</Button>
              )} */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
