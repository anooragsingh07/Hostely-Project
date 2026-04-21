import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-compatible class merger. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
