import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateFr(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function shortDateFr(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
