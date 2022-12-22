import { z } from "zod";

/**
 * It takes a date string, parses it, and returns a formatted date string
 * @param {string} dateString - The date string to be formatted.
 * @returns A string
 */
export const displayFormattedDate = (dateString: string) => {
  const dateSchema = z.date();
  const date = new Date(dateString);

  const result = dateSchema.safeParse(date);

  if (!result.success) {
    return " --invalid date-- ";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
