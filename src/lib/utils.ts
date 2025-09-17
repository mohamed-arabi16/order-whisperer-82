import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to merge CSS classes.
 * It combines class names and resolves conflicts.
 *
 * @param {...ClassValue[]} inputs - A list of class values to merge.
 * @returns {string} The merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string for the Syrian Pound (SYP).
 *
 * @param {number} amount - The amount to be formatted.
 * @param {string} [currency='SYP'] - The currency to format the amount in.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(amount: number, currency: string = 'SYP'): string {
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

