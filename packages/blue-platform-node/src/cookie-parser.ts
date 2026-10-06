/**
 * RFC 6265-style cookie parsing for `NodeRequest.cookies`.
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
/** Default cap on parsed cookie entries per request. */
export const DEFAULT_MAX_COOKIES = 50;

/** Default cap on a single cookie value's byte length. */
export const DEFAULT_MAX_COOKIE_VALUE_BYTES = 4_096;

export interface CookieParseOptions {
    /** Maximum number of cookies parsed per request (default 50). */
    maxCookies?: number;
    /** Maximum byte length of any single cookie value (default 4096). */
    maxValueBytes?: number;
}

/**
 * Parses a raw `Cookie` header value into a name→value record.
 * Duplicated names keep the **first** occurrence (RFC 6265 §5.3 ordering);
 * malformed entries (no `=`, empty name) are skipped.
 *
 * @throws {RangeError} when the entry or value limits are exceeded.
 */
export function parseCookies(header: string | undefined, options: CookieParseOptions = {}): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!header || header.length === 0) return cookies;
    const maxCookies = options.maxCookies ?? DEFAULT_MAX_COOKIES;
    const maxValueBytes = options.maxValueBytes ?? DEFAULT_MAX_COOKIE_VALUE_BYTES;

    for (const part of header.split(';')) {
        const separator = part.indexOf('=');
        if (separator <= 0) continue; // no '=' or empty name
        const name = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();
        if (name.length === 0) continue;
        if (Object.keys(cookies).length >= maxCookies) {
            throw new RangeError(`Cookie header exceeds ${maxCookies} entries`);
        }
        if (Buffer.byteLength(value, 'utf-8') > maxValueBytes) {
            throw new RangeError(`Cookie value exceeds ${maxValueBytes} bytes`);
        }
        if (!(name in cookies)) {
            cookies[name] = value;
        }
    }
    return cookies;
}
