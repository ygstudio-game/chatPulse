import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatMessageTimestamp(timestamp?: number) {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  // Verify date is valid
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) {
    return timeString;
  }

  const dateStringOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (!isThisYear) {
    dateStringOptions.year = "numeric";
  }

  const dateString = date.toLocaleDateString([], dateStringOptions);
  return `${dateString}, ${timeString}`;
}
