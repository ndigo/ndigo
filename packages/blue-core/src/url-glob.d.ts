/**
 * @author Jeff Rose
 * @see {@link https://en.wikipedia.org/wiki/Glob_(programming)#Syntax}
 */
/**
 * Parses a URL/route glob pattern into an anchored regular-expression source string.
 *
 * Returns `null` if the pattern cannot be parsed.
 * The returned string is suitable for `new RegExp(result)`.
 *
 * @param pattern - The URL glob pattern to parse (e.g. `/api/*`, `**`, `[:alnum:]*`).
 * @returns An anchored regex source string, or `null` if the pattern is invalid.
 */
export declare function parseUrlGlob(pattern: string): string | null;
