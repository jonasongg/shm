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
import { cn, toAbsoluteUrl } from "@/lib/utils";
import { Loader2Icon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteVmDialog({
  name,
  id,
}: {
  name: string;
  id: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<
    "notSubmitting" | "reports" | "vm"
  >("notSubmitting");

  const handleSubmit = async (isReportOnly: boolean) => {
    setSubmitting(isReportOnly ? "reports" : "vm");
    try {
      const response = await fetch(
        toAbsoluteUrl(`/vm/${id}${isReportOnly ? "/reports" : ""}`),
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
    } finally {
      setSubmitting("notSubmitting");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="cursor-pointer mb-[-16px] ml-auto"
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
            className="bg-destructive/20 hover:bg-destructive/30 text-destructive/80 cursor-pointer"
            onClick={() => handleSubmit(true)}
            disabled={submitting !== "notSubmitting"}
          >
            {submitting === "reports" && (
              <Loader2Icon className="animate-spin" />
            )}
            {"Delete VM's reports"}
          </AlertDialogAction>
          <AlertDialogAction
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "cursor-pointer",
            )}
            onClick={() => handleSubmit(false)}
            disabled={submitting !== "notSubmitting"}
          >
            {submitting === "vm" && <Loader2Icon className="animate-spin" />}
            Delete VM
          </AlertDialogAction>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
