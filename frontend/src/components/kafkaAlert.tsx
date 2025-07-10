"use client";

import { AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function KafkaAlert() {
  const { theme } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="header"
          className="cursor-default bg-destructive/10 hover:bg-destructive/10 hover:border-destructive/20 dark:bg-destructive/60 dark:hover:bg-destructive/70 dark:hover:border-destructive/80"
        >
          <AlertCircle color={theme === "dark" ? "black" : "red"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        className="bg-red-700 dark:bg-red-300"
        fillClassName="bg-red-700 fill-red-700 dark:bg-red-300 dark:fill-red-300"
      >
        The Kafka broker is down!
      </TooltipContent>
    </Tooltip>
  );
}
