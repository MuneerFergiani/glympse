import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A combination of `clsx` and `twMerge`
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if the execution environment is server-side
 */
export function isServerSide() {
  return typeof window === "undefined";
}
