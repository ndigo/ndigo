/**
 * OpenTelemetry instrumentation for `@ndigo/locks`.
 */
import { SpanKind } from '@opentelemetry/api';
import { InProcessLockDriver } from '@ndigo/locks';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `LockInstrumentation`.
 */
export class LockInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('locks');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            InProcessLockDriver.prototype,
            'acquire',
            this._patch({ name: 'Lock.acquire', kind: SpanKind.INTERNAL })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(InProcessLockDriver.prototype, 'acquire');
    }
}
