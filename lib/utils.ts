import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}

export function generateTicketNumber(): string {
  // Generate a ticket in the format: 15G 12902 (Two digits, one alphabet letter, space, five digits)
  const firstTwoDigits = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0")
  const alphabetLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const fiveDigits = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")

  return `${firstTwoDigits}${alphabetLetter} ${fiveDigits}`
}

export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
