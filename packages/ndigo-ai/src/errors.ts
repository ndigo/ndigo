/**
 * Typed failures raised by the agent loop before or around a model call.
 */
import { ApplicationError } from '@ndigo/core';

/**
 * The rate limiter refused the model call. The caller may retry after
 * {@link AIRateLimitError.retryAfterMs}.
 */
export class AIRateLimitError extends ApplicationError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AIRateLimitError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AIRateLimitError]"
     */
    get [Symbol.toStringTag](): string {
        return 'AIRateLimitError';
    }

    /**
     * Milliseconds until the current rate-limit window resets.
     */
    readonly retryAfterMs: number;

    /**
     * @param key - The rate-limit key that was exhausted.
     * @param retryAfterMs - Milliseconds until the window resets.
     */
    constructor(key: string, retryAfterMs: number) {
        super(`AI rate limit exceeded for '${key}' — retry in ${retryAfterMs} ms`);
        this.retryAfterMs = retryAfterMs;
    }
}

/**
 * The model rollout flag evaluated to `false`, so the agent refused the call.
 */
export class AIModelDisabledError extends ApplicationError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AIModelDisabledError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AIModelDisabledError]"
     */
    get [Symbol.toStringTag](): string {
        return 'AIModelDisabledError';
    }

    /**
     * @param flag - The feature-flag key that disabled the model.
     */
    constructor(flag: string) {
        super(`AI model is disabled by feature flag '${flag}'`);
    }
}
