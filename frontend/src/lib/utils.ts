import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numberFormatter = (x: number) =>
  x.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });

export const bytesFormatter = (x: number) => (x / 1024 / 1024).toFixed(1);

export const toAbsoluteUrl = (url: string) => "http://localhost:5043/api" + url;

export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number,
) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function formatDateDifferentlyIfSameDay(
  x: Date,
  y: Date,
  sameDay: Intl.DateTimeFormatOptions,
  differentDay: Intl.DateTimeFormatOptions,
  z: Date,
): string;
export function formatDateDifferentlyIfSameDay(
  x: Date,
  y: Date,
  sameDay: Intl.DateTimeFormatOptions,
  differentDay: Intl.DateTimeFormatOptions,
): [string, string];
export function formatDateDifferentlyIfSameDay(
  x: Date,
  y: Date,
  sameDay: Intl.DateTimeFormatOptions,
  differentDay: Intl.DateTimeFormatOptions,
  z?: Date,
) {
  const isSameDay = x.toDateString() === y.toDateString();
  return z
    ? z.toLocaleString("en-SG", isSameDay ? sameDay : differentDay)
    : [
        x.toLocaleString("en-SG", isSameDay ? sameDay : differentDay),
        y.toLocaleString("en-SG", isSameDay ? sameDay : differentDay),
      ];
}
