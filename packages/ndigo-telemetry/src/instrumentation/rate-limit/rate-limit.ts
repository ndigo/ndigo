/**
 * OpenTelemetry instrumentation for `@ndigo/rate-limit`.
 */
import { SpanKind } from '@opentelemetry/api';
import { FixedWindowRateLimiter } from '@ndigo/rate-limit';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `RateLimitInstrumentation`.
 */
export class RateLimitInstrumentation extends AbstractBaseInstrumentation {
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
