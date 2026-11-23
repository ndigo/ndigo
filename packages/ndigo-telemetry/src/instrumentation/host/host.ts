/**
 * OpenTelemetry instrumentation for `@ndigo/host`.
 */
import { SpanKind } from '@opentelemetry/api';
import { HostManager } from '@ndigo/host';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `HostInstrumentation`.
 *
 * @example
 * ```ts
 * const instance = new HostInstrumentation();
 * ```
 */
export class HostInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "HostInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object HostInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'HostInstrumentation';
    }

    constructor() {
        super('host');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            HostManager.prototype,
            'registerFeature',
            this._patchSync({ name: 'HostManager.registerFeature', kind: SpanKind.INTERNAL })
        );
        this._wrap(
            HostManager.prototype,
            'unregister',
            this._patchSync({ name: 'HostManager.unregister', kind: SpanKind.INTERNAL })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(HostManager.prototype, 'registerFeature');
        this._unwrap(HostManager.prototype, 'unregister');
    }
}
