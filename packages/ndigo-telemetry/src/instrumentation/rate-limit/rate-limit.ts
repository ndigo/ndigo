/**
 * OpenTelemetry instrumentation for `@ndigo/rate-limit`.
 */
import { SpanKind } from '@opentelemetry/api';
import { FixedWindowRateLimiter } from '@ndigo/rate-limit';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `RateLimitInstrumentation`.
 *
 * @example
 * ```ts
 * const instance = new RateLimitInstrumentation();
 * ```
 */
export class RateLimitInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "RateLimitInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object RateLimitInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'RateLimitInstrumentation';
    }

    constructor() {
        super('rate-limit');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            FixedWindowRateLimiter.prototype,
            'consume',
            this._patch({ name: 'RateLimit.consume', kind: SpanKind.INTERNAL })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(FixedWindowRateLimiter.prototype, 'consume');
    }
}
