import {
  GridStack,
  GridStackElement,
  GridStackOptions,
  GridStackWidget,
} from "gridstack";
import {
  PropsWithChildren,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GridStackContext } from "./gridStackContext";

export const GridStackProvider = ({
  children,
  initialOptions,
  disabled,
}: PropsWithChildren<{
  initialOptions: GridStackOptions;
  disabled: boolean;
}>) => {
  const [gridStack, setGridStack] = useState<GridStack | null>(null);
  const gridStackElRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (gridStackElRef.current) {
      try {
        setGridStack(GridStack.init(initialOptions, gridStackElRef.current));
      } catch (e) {
        console.error("Error initializing gridstack", e);
      }
    }
  }, [initialOptions]);

  const makeWidget = useCallback(
    (element: GridStackElement, options?: GridStackWidget) =>
      gridStack?.makeWidget(element, options),
    [gridStack],
  );

  const removeWidget = useCallback(
    (element: GridStackElement) => gridStack?.removeWidget(element, false),
    [gridStack],
  );

  const contextValues = useMemo(
    () => ({
      initialOptions,
      disabled,
      makeWidget,
      removeWidget,
    }),
    [disabled, makeWidget, removeWidget, initialOptions],
  );

  return (
    <GridStackContext.Provider value={contextValues}>
      <div ref={gridStackElRef} className="h-full flex flex-wrap gap-8">
        {children}
      </div>
    </GridStackContext.Provider>
  );
};
