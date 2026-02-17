import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTimestamp(input: unknown): Date {
  if (!input) return new Date(NaN);

  if (typeof input === "object" && input !== null && "seconds" in input) {
    const obj = input as { seconds: unknown; nanos?: unknown };
    const ms = Number(obj.seconds) * 1_000 + Number(obj.nanos ?? 0) / 1_000_000;
    return new Date(ms);
  }

  const num = Number(input);
  if (!isNaN(num)) {
    return num < 10_000_000_000 ? new Date(num * 1_000) : new Date(num);
  }

  return new Date(String(input));
}
