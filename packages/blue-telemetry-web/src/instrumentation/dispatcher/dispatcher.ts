import { SpanKind } from '@opentelemetry/api';
import * as dispatcher from '@blue/dispatcher';
import { Route } from '@blue/router';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

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
        const target = (dispatcher as any).AbstractDispatcher.prototype;
        // The decorator-mixin prototype chain does not derive from
        // Object.prototype (its `propertyIsEnumerable` is absent), which
        // breaks shimmer's wrap() (it calls obj.propertyIsEnumerable).
        // Restore the Object.prototype method so instrumentation can wrap.
        if (typeof target.propertyIsEnumerable !== 'function') {
            target.propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
        }
        this._wrap(
            (dispatcher as any).AbstractDispatcher.prototype,
            'dispatch',
            this._patchAsync({
                name: 'Dispatcher.dispatch',
                kind: SpanKind.SERVER,
                attributes: (_instance: any, args: any[]) => ({
                    'route.path': (args[0] as Route).path,
                }),
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
            (dispatcher as any).AbstractDispatcher.prototype,
            '_resolveViewName',
            this._patchAsync({
                name: 'Dispatcher.resolveViewName',
                kind: SpanKind.INTERNAL,
                attributes: (_instance: any, args: any[]) => ({
                    'view.name': args[0],
                }),
                onEnd(span, outcome, _instance, args) {
                    const resolved = outcome.ok && outcome.value !== null;
                    span.setAttribute('view.resolved', resolved);
                    if (resolved) {
                        // The winning resolver owns the instance → its name.
                        span.setAttribute('view.resolved_by', (outcome.value as object).constructor?.name);
                    }
                },
            })
        );
    }

    disable(): void {
        this._unwrap((dispatcher as any).AbstractDispatcher.prototype, 'dispatch');
        this._unwrap((dispatcher as any).AbstractDispatcher.prototype, '_resolveViewName');
    }
}
