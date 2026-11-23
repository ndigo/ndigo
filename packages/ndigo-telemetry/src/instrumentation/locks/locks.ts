/**
 * OpenTelemetry instrumentation for `@ndigo/locks`.
 */
import { SpanKind } from '@opentelemetry/api';
import { InProcessLockDriver } from '@ndigo/locks';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `LockInstrumentation`.
 *
 * @example
 * ```ts
 * const instance = new LockInstrumentation();
 * ```
 */
export class LockInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "LockInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object LockInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'LockInstrumentation';
    }

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
