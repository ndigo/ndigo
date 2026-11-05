/**
 * Small request-value helpers shared by the controllers.
 *
 * HTML pages read their inputs as text — a path segment is a string, and a
 * query string is text — so the coercion (and its failure mode) lives in one
 * place instead of being re-derived per handler.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Reads a path/query value as a positive integer id.
 *
 * A non-numeric, zero or negative value is `undefined` — the handlers turn that
 * into the same `404` a missing row produces, so `/owners/abc` and
 * `/owners/999` answer identically instead of one of them becoming a `500`.
 *
 * @param value - The raw text (or number) to read.
 * @returns The positive integer, or `undefined` when the text is not one.
 */
export function toPositiveInt(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
