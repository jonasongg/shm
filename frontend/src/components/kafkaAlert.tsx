"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function KafkaAlert() {
  const { theme } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          buttonVariants({ variant: "header", size: "icon" }),
          "cursor-default bg-destructive/10 hover:bg-destructive/10 hover:border-destructive/20 dark:bg-destructive/60 dark:hover:bg-destructive/70 dark:hover:border-destructive/80",
        )}
      >
        <AlertCircle color={theme === "dark" ? "black" : "red"} />
      </TooltipTrigger>
      <TooltipContent>The Kafka broker is down!</TooltipContent>
    </Tooltip>
  );
}
