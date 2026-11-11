/**
 * OpenTelemetry instrumentation for `@ndigo/locks`.
 */
import { SpanKind } from '@opentelemetry/api';
import { InProcessLockDriver } from '@ndigo/locks';
import { AbstractBaseInstrumentation } from '../base';

export class LockInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('locks');
    }

    enable(): void {
        this._wrap(InProcessLockDriver.prototype, 'acquire', this._patch({ name: 'Lock.acquire', kind: SpanKind.INTERNAL }));
    }

    disable(): void {
        this._unwrap(InProcessLockDriver.prototype, 'acquire');
    }
}