/**
 * OpenTelemetry instrumentation for `@ndigo/resilience`.
 */
import { SpanKind } from '@opentelemetry/api';
import { CircuitBreakerInterceptor, RetryInterceptor } from '@ndigo/resilience';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `ResilienceInstrumentation`.
 */
export class ResilienceInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ResilienceInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ResilienceInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'ResilienceInstrumentation';
    }

    constructor() {
        super('resilience');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            CircuitBreakerInterceptor.prototype,
            'invoke',
            this._patch({ name: 'CircuitBreaker.invoke', kind: SpanKind.INTERNAL })
        );
        this._wrap(
            RetryInterceptor.prototype,
            'invoke',
            this._patch({ name: 'Retry.invoke', kind: SpanKind.INTERNAL })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(CircuitBreakerInterceptor.prototype, 'invoke');
        this._unwrap(RetryInterceptor.prototype, 'invoke');
    }
}
