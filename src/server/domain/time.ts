/** Company time is GMT+8 (SRS 4.8); a "day" is midnight to midnight there. */
const OFFSET_MS = 8 * 60 * 60 * 1000;

/** UTC bounds of one Manila calendar day. `date` is YYYY-MM-DD; defaults to today. */
export function manilaDay(date?: string | null) {
  const day = date ?? manilaDate();
  const start = new Date(new Date(`${day}T00:00:00Z`).getTime() - OFFSET_MS);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000), day };
}

/** Today's date in Manila as YYYY-MM-DD. */
export function manilaDate(at: Date = new Date()) {
  return new Date(at.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}
