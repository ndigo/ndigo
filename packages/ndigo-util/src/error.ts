/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Extracts a human-readable message from an unknown thrown value.
 *
 * `Error` instances (and subclasses) contribute their `message`; every other
 * value is coerced with `String(...)`, so catch sites never hand-inline the
 * `error instanceof Error ? error.message : String(error)` guard.
 *
 * @param error - The unknown thrown value.
 * @returns The error message as a string.
 */
export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
