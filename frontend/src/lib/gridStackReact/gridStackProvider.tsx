import {
  GridStack,
  GridStackElement,
  GridStackOptions,
  GridStackWidget,
} from "gridstack";
import "gridstack/dist/gridstack.min.css";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GridStackContext, GridStackWidgetWithId } from "./gridStackContext";

export const GridStackProvider = ({
  children,
  initialOptions,
  disabled,
}: PropsWithChildren<{
  initialOptions: GridStackOptions;
  disabled: boolean;
}>) => {
  const [gridStack, setGridStack] = useState<GridStack | null>(null);
  const [gridWidgets, setGridWidgets] = useState<
    Record<string, GridStackWidgetWithId>
  >({});
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

  const saveWidget = useCallback(
    (id: string) => {
      if (!gridStack) return;

      const widgets = gridStack.save() as GridStackWidget[];
      const widget = widgets.find((w) => w.id === id);
      if (widget) {
        setGridWidgets((prev) => ({ ...prev, [id]: { ...widget, id } }));
      }
    },
    [gridStack],
  );

  const getSavedWidget = useCallback(
    (id: string) => {
      const widget = gridWidgets[id];
      if (widget) {
        return { ...widget, id };
      }
    },
    [gridWidgets],
  );

  useEffect(() => void gridStack?.setStatic(disabled), [gridStack, disabled]);

  // to prevent 'r' to rotate feature by gridstack
  useEffect(() => {
    gridStack?.on("dragstart", (_, el) => {
      if (el.gridstackNode) el.gridstackNode.noResize = true;
    });

    gridStack?.on("dragstop", (_, el) => {
      if (el.gridstackNode) el.gridstackNode.noResize = false;
    });

    return () => {
      gridStack?.off("dragstart");
      gridStack?.off("dragstop");
    };
  }, [gridStack]);

  const contextValues = useMemo(
    () => ({
      initialOptions,
      makeWidget,
      removeWidget,
      saveWidget,
      getSavedWidget,
    }),
    [initialOptions, makeWidget, removeWidget, saveWidget, getSavedWidget],
  );

  return (
    <GridStackContext.Provider value={contextValues}>
      <div ref={gridStackElRef} className="h-full flex flex-wrap gap-8">
        {children}
      </div>
    </GridStackContext.Provider>
  );
};
