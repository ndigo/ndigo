/**
 */
import { SpanKind } from '@opentelemetry/api';
import { AbstractDispatcher } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { AbstractBaseInstrumentation } from '../base';

/**
 * The prototype slots the dispatcher instrumentation's shimmer patches need.
 * `AbstractDispatcher` is built from a decorator-mixin strategy stack, so the
 * runtime prototype chain diverges from the declared class shape (it even
 * lacks `Object.prototype` members like `propertyIsEnumerable`).
 */
interface DispatcherPatchTarget {
    dispatch(route: Route): Promise<void>;
    _resolveViewName(viewName: string, language: string, request?: unknown): Promise<unknown>;
    /** Missing on the mixin prototype chain; restored before shimmer wraps. */
    propertyIsEnumerable?(propertyName: string | symbol): boolean;
}

/**
 * An OpenTelemetry instrumentation for the `@ndigo/dispatcher` package.
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
        // type hides `_resolveViewName` (protected) and the runtime chain shape.
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
                // Route dispatch is internal application work; the inbound
                // HTTP request owns the SERVER boundary (TEL-11).
                kind: SpanKind.INTERNAL,
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

        // View-name resolution: which resolver served the name (and whether
        // the chain fell through) is otherwise invisible.
        this._wrap(
            target,
            '_resolveViewName',
            this._patch({
                name: 'Dispatcher.resolveViewName',
                kind: SpanKind.INTERNAL,
                attributes: (_instance: unknown, args: unknown[]) => ({
                    'view.name': args[0],
                }),
                onEnd(span, outcome) {
                    const resolved = outcome.ok && outcome.value !== null;
                    span.setAttribute('view.resolved', resolved);
                    if (resolved && typeof outcome.value === 'object' && outcome.value !== null) {
                        // The winning resolver owns the instance → its
                        // constructor names the view type it produced.
                        span.setAttribute('view.resolved_by', outcome.value.constructor.name);
                    }
                },
            })
        );
    }

    disable(): void {
        const target = AbstractDispatcher.prototype as unknown as DispatcherPatchTarget;
        this._unwrap(target, 'dispatch');
        this._unwrap(target, '_resolveViewName');
    }
}
