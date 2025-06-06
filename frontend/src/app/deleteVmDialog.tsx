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
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteVmDialog({
  name,
  vmId,
}: {
  name: string;
  vmId: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (isReportOnly: boolean) => {
    // const response = await fetch(toAbsoluteUrl("/vm"), {
    //   method: "DELETE",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(values),
    // });
    // if (response.ok) {
    //   setOpen(false);
    //   toast(`VM ${values.name} created successfully!`, {
    //     position: "bottom-center",
    //   });
    //   // update vm list
    //   router.refresh();
    // } else {
    //   form.setError("name", {
    //     message:
    //       (await response.json()) || "Failed to add VM. Please try again.",
    //   });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
            Delete VM's reports
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
