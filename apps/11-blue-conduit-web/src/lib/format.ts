/**
 * Presentation formatting for API values.
 *
 * The API answers ISO-8601 timestamps; the UI shows them the way the RealWorld
 * reference frontends do. A timestamp the platform cannot parse is shown as an
 * empty string rather than `Invalid Date`, so a malformed value degrades to
 * missing metadata instead of leaking a debug string into the page.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Formats an ISO-8601 timestamp as `October 6, 2026`.
 *
 * @param iso - The timestamp from the API.
 * @returns The formatted date, or `''` when it is not a valid date.
 */
export function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Splits a comma-separated tag input into clean tags.
 *
 * @param input - The raw input value, e.g. `realworld, bluejs, `.
 * @returns Unique, trimmed, non-empty tags.
 */
export function parseTags(input: string): string[] {
    return [...new Set(input.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0))];
}
