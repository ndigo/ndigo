/**
 * OpenTelemetry instrumentation for `@ndigo/boot`.
 */
import { SpanKind } from '@opentelemetry/api';
import { Application } from '@ndigo/boot';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `BootInstrumentation`.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *     instrumentations: [new BootInstrumentation()],
 * });
 * ```
 */
export class BootInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "BootInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object BootInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'BootInstrumentation';
    }

    constructor() {
        super('boot');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            Application.prototype,
            'run',
            this._patch({
                name: 'Application.run',
                kind: SpanKind.INTERNAL,
            })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(Application.prototype, 'run');
    }
}
