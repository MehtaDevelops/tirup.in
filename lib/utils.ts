import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CONVEX_API_URL = process.env.NEXT_PUBLIC_CONVEX_API_URL || "https://accomplished-condor-793.convex.site"
