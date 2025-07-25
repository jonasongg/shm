"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toAbsoluteUrl } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  deleteType: z.enum(["Vm", "VmDocker", "Reports"]),
});

export type DeleteVmRequestType = z.infer<typeof formSchema>;

export default function DeleteVmDialog({
  name,
  id,
}: {
  name: string;
  id: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<DeleteVmRequestType>({
    resolver: zodResolver(formSchema),
    defaultValues: { deleteType: "VmDocker" },
  });

  const onSubmit = async (values: DeleteVmRequestType) => {
    const isReportOnly = values.deleteType === "Reports";
    try {
      const response = await fetch(toAbsoluteUrl(`/vm/${id}`), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setOpen(false);
        toast(
          `VM ${name}${isReportOnly ? "'s reports" : ""} deleted successfully!`,
        );
        // update vm list
        router.refresh();
      } else {
        form.setError("deleteType", {
          message:
            (await response.json()) || "Failed to add VM. Please try again.",
        });
      }
    } catch (e) {
      toast("There was an error in deleting the VM.");
      console.error(e);
      setOpen(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        form.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          className="mb-[-16px] ml-auto bg-destructive/10 hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30"
          variant="secondary"
          size="icon"
        >
          <Trash color="red" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{`Are you sure you want to delete "${name}"?`}</AlertDialogTitle>
              <AlertDialogDescription>
                You can either choose how you want to delete this VM.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <FormField
              control={form.control}
              name="deleteType"
              render={({ field }) => (
                <FormItem className="justify-center py-2">
                  <FormLabel className="pb-2">Choose what to delete:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col"
                    >
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="VmDocker" />
                        </FormControl>
                        <FormLabel className="font-normal text-red-600">
                          VM and its Docker container
                        </FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="Vm" />
                        </FormControl>
                        <FormLabel className="font-normal text-red-700">
                          VM only (keep Docker container)
                        </FormLabel>
                      </FormItem>

                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="Reports" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {"VM's reports only (keep VM and Docker container)"}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <Button
                variant="destructive"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting && (
                  <Loader2Icon className="animate-spin" />
                )}
                Confirm
              </Button>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
