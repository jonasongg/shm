import { GridStackWidget } from "gridstack";
import { useLayoutEffect, useRef } from "react";
import { useGridStackContext } from "./gridStackContext";

export const useGridStack = (options: GridStackWidget) => {
  const { makeWidget, removeWidget } = useGridStackContext();
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);

  const handleRef = (element: HTMLDivElement | null) => {
    if (element) ref.current = element;
  };

  useLayoutEffect(() => {
    const element = ref.current;
    const opts = optionsRef.current;
    if (element) {
      makeWidget(element, opts);
    }
    return () => {
      if (element) {
        removeWidget(element);
      }
    };
  }, [makeWidget, removeWidget]);

  return { ref: handleRef };
};
