import { useRef } from "react";

export const useDebounce = (
  func: (...args: unknown[]) => void,
  delay: number,
) => {
  const timeoutId = useRef(setTimeout(() => {}, 0));

  return (...args: unknown[]) => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => func(...args), delay);
  };
};
