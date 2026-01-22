/**
 * Date utility functions for formatting and comparison.
 */

/**
 * Checks if a date string represents today.
 * @param dateString - ISO date string to check
 * @returns true if the date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date.getTime() === today.getTime();
}

/**
 * Checks if a date string represents yesterday.
 * @param dateString - ISO date string to check
 * @returns true if the date is yesterday
 */
export function isYesterday(dateString: string): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  date.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  return date.getTime() === yesterday.getTime();
}

/**
 * Calculates how many days ago a date was from today.
 * @param dateString - ISO date string to check
 * @returns Number of days ago (0 for today, 1 for yesterday, etc.)
 */
export function getDaysAgo(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
