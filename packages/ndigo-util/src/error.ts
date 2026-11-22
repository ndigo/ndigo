/**
 * Error message extraction utilities.
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
 *
 * @example
 * ```ts
 * try {
 *     riskyOperation();
 * } catch (error) {
 *     logger.error(getErrorMessage(error));
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/**
 * Normalizes an unknown thrown value into an `Error` instance.
 *
 * `Error` instances (and subclasses) are returned unchanged; every other
 * value is wrapped in a new `Error` whose message is the coerced string. Use
 * this at telemetry/span boundaries and `cause`-preserving sites so a
 * non-`Error` throw never reaches an API that expects an `Error`.
 *
 * @param error - The unknown thrown value.
 * @returns An `Error` instance.
 *
 * @example
 * ```ts
 * try {
 *     await riskyOperation();
 * } catch (error) {
 *     throw toError(error);
 * }
 * ```
 */
export function toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}
