/**
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind } from '@opentelemetry/api';
import { AbstractDispatcher } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { AbstractBaseInstrumentation } from '../base';

/**
 * The prototype slots the dispatcher instrumentation's shimmer patches need.
 * `AbstractDispatcher` is built from a decorator-mixin strategy stack, so the
 * runtime prototype chain diverges from the declared class shape (it even
 * lacks `Object.prototype` members like `propertyIsEnumerable`).
 */
interface DispatcherPatchTarget {
    dispatch(route: Route): Promise<void>;
    /** Missing on the mixin prototype chain; restored before shimmer wraps. */
    propertyIsEnumerable?(propertyName: string | symbol): boolean;
}

/**
 * An OpenTelemetry instrumentation for the `@blue/dispatcher` package.
 *
 * This instrumentation automatically creates spans for the `dispatch` method,
 * providing visibility into route dispatching processes.
 */
export class DispatcherInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('dispatcher');
    }

    enable(): void {
        // Patch slots live on the mixin-built prototype; the declared class
        // type hides that runtime shape from shimmer's `_wrap` contract.
        const target = AbstractDispatcher.prototype as unknown as DispatcherPatchTarget;
        // The decorator-mixin prototype chain does not derive from
        // Object.prototype (its `propertyIsEnumerable` is absent), which
        // breaks shimmer's wrap() (it calls obj.propertyIsEnumerable).
        // Restore the Object.prototype method so instrumentation can wrap.
        if (typeof target.propertyIsEnumerable !== 'function') {
            target.propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
        }
        this._wrap(
            target,
            'dispatch',
            this._patch({
                name: 'Dispatcher.dispatch',
                kind: SpanKind.SERVER,
                attributes: (_instance: unknown, args: unknown[]) => {
                    // `dispatch`'s signature: the first argument is the route.
                    const route = args[0] as Route;
                    return { 'route.path': route.path };
                },
                onEnd(span, outcome, _instance, args) {
                    const route = args[0] as Route;
                    if (route.method) {
                        span.setAttribute('http.method', route.method);
                    }
                    span.setAttribute('http.route', route.path);
                    if (outcome.ok) {
                        // `dispatch` resolves with void; the rendered status is
                        // recorded by HTTPResponseViewTargetInstrumentation.
                        span.setStatus({ code: 0 /* OK */ });
                    } else {
                        span.setAttribute('error.type', 'dispatch');
                    }
                },
            })
        );
    }

    disable(): void {
        const target = AbstractDispatcher.prototype as unknown as DispatcherPatchTarget;
        this._unwrap(target, 'dispatch');
    }
}
