import { useLayoutEffect, useRef } from "react";
import { GridStackWidgetWithId, useGridStackContext } from "./gridStackContext";

export const useGridStack = (options: GridStackWidgetWithId) => {
  const { makeWidget, removeWidget, saveWidget, getSavedWidget } =
    useGridStackContext();
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);

  const handleRef = (element: HTMLDivElement | null) => {
    if (element) ref.current = element;
  };

  useLayoutEffect(() => {
    const element = ref.current;
    const opts = optionsRef.current;
    if (element) {
      const savedWidget = getSavedWidget(opts.id);
      makeWidget(element, savedWidget ?? opts);
    }
    return () => {
      if (element) {
        saveWidget(opts.id);
        removeWidget(element);
      }
    };
  }, [makeWidget, removeWidget, getSavedWidget, saveWidget]);

  return { ref: handleRef };
};
