/**
 * OpenTelemetry instrumentation for `@ndigo/cluster`.
 */
import { SpanKind } from '@opentelemetry/api';
import { ClusterRunner } from '@ndigo/cluster';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `ClusterInstrumentation`.
 */
export class ClusterInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ClusterInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ClusterInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'ClusterInstrumentation';
    }

    constructor() {
        super('cluster');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(ClusterRunner.prototype, 'run', this._patch({ name: 'ClusterRunner.run', kind: SpanKind.INTERNAL }));
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(ClusterRunner.prototype, 'run');
    }
}
