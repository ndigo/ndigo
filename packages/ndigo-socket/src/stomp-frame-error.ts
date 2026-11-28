/**
 * STOMP protocol error type.
 */
import { FrameworkError } from '@ndigo/core';

/**
 * Error thrown when a STOMP frame is malformed.
 *
 * @example
 * ```ts
 * throw new STOMPProtocolError('missing command');
 * ```
 */
export class STOMPProtocolError extends FrameworkError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "STOMPProtocolError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object STOMPProtocolError]"
     */
    get [Symbol.toStringTag](): string {
        return 'STOMPProtocolError';
    }

    /**
     * Creates the protocol error for a malformed frame.
     *
     * @param message - Human-readable protocol failure detail.
     */
    constructor(message: string) {
        super(message);
        this.name = 'STOMPProtocolError';
    }
}
