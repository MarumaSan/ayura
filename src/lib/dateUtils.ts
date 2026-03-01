/**
 * Centralized utility for handling Thai Timezone (Asia/Bangkok, UTC+7)
 * Since Vercel runtime is locked to UTC, we must manually offset dates.
 */

/**
 * Returns a new Date object shifted to Thai time (UTC+7).
 * Note: This produces a Date object whose "UTC" internal time is actually 
 * shifted to local Thai time for simple formatting/string manipulation.
 */
export function getThaiDate(): Date {
    const now = new Date();
    // Offset is always +7 hours for Thailand (no daylight savings)
    const THAI_OFFSET = 7 * 60 * 60 * 1000;
    return new Date(now.getTime() + THAI_OFFSET);
}

/**
 * Formats a Date object to a Thai date string (YYYY-MM-DD).
 */
export function formatThaiDate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Formats a Date object to a short Thai date string (YYMMDD) for IDs.
 */
export function formatThaiIdDate(date: Date): string {
    const yy = date.getUTCFullYear().toString().slice(-2);
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
}
