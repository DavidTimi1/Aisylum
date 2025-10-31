import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function rateLimit(fn: (...args: any[]) => Promise<any> | any, delay: number) {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return async (...args: any[]) => {
    const now = Date.now();

    if (now - lastCall < delay) {
      return null; // or throw new Error("Rate limited")
    }

    lastCall = now;

    try {
      return await fn(...args);
    } finally {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => (lastCall = 0), delay);
    }
  };
}
