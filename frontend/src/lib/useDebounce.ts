import { useRef } from "react";

export const useDebounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number,
) => {
  const timeoutId = useRef(setTimeout(() => {}, 0));

  return (...args: T) => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => func(...args), delay);
  };
};
