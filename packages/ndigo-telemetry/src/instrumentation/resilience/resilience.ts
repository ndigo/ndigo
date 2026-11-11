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
    constructor() {
        super('resilience');
    }

    enable(): void {
        this._wrap(CircuitBreakerInterceptor.prototype, 'invoke', this._patch({ name: 'CircuitBreaker.invoke', kind: SpanKind.INTERNAL }));
        this._wrap(RetryInterceptor.prototype, 'invoke', this._patch({ name: 'Retry.invoke', kind: SpanKind.INTERNAL }));
    }

    disable(): void {
        this._unwrap(CircuitBreakerInterceptor.prototype, 'invoke');
        this._unwrap(RetryInterceptor.prototype, 'invoke');
    }
}