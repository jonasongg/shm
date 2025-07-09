import {
  GridItemHTMLElement,
  GridStackElement,
  GridStackOptions,
  GridStackWidget,
} from "gridstack";
import { createContext, useContext } from "react";

export type GridStackWidgetWithId = GridStackWidget & { id: string };
export type GridStackContextType = {
  initialOptions: GridStackOptions;

  makeWidget: (
    element: GridStackElement,
    options: GridStackWidgetWithId,
  ) => void;
  removeWidget: (element: GridItemHTMLElement) => void;

  saveWidget: (id: string) => void;
  getSavedWidget: (id: string) => GridStackWidgetWithId | undefined;
};

export const GridStackContext = createContext<GridStackContextType | null>(
  null,
);

export const useGridStackContext = () => {
  const context = useContext(GridStackContext);
  if (!context) {
    throw new Error(
      "useGridStackContext must be used within a GridStackProvider",
    );
  }
  return context;
};
