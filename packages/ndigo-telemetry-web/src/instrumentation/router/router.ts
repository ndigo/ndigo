/**
 * OpenTelemetry instrumentation for `HashRouter` route changes.
 */
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { HashRouter } from '@ndigo/platform-web';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * The prototype slot the router instrumentation's shimmer patch needs.
 * `_setRoute` is protected on `HashRouter`, so it is not part of the
 * instance's public `keyof` — widen to the slot shape for wrapping.
 */
interface HashRouterPatchTarget {
    _setRoute(newRoute: string, syncHash?: boolean): Promise<boolean>;
}

/**
 * An OpenTelemetry instrumentation for the `@ndigo/router` package, specifically `HashRouter`.
 *
 * This instrumentation automatically creates spans for the internal `_setRoute` method,
 * providing visibility into route change events within the application.
 */
export class RouterInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('router');
    }

    /**
     * Patches `HashRouter#_setRoute` to record one span per navigation.
     */
    enable(): void {
        this._wrap(
            // NOTE: bridging to HashRouterPatchTarget — the source type is wider than this consumer's contract.
            HashRouter.prototype as unknown as HashRouterPatchTarget,
            '_setRoute',
            this._patch({
                name: 'Router.setRoute',
                // In-app navigation is internal router work, not a network
                // boundary (TEL-11).
                kind: SpanKind.INTERNAL,
                attributes: (_instance: unknown, args: unknown[]) => ({
                    'router.route': args[0],
                }),
                // `_setRoute` is async: the span must end when the navigation
                // promise settles (OP-3), not when it is returned, and a
                // rejection must be recorded. The router swallows navigation
                // failures — interceptor rejection or a thrown handler resolve
                // `false` — so flag that outcome as an error as well.
                onEnd: (span, outcome) => {
                    if (outcome.ok && outcome.value === false) {
                        span.setStatus({ code: SpanStatusCode.ERROR, message: 'navigation rejected' });
                    }
                },
            })
        );
    }

    /**
     * Restores the original `_setRoute` implementation.
     */
    disable(): void {
        // NOTE: bridging to HashRouterPatchTarget — the source type is wider than this consumer's contract.
        this._unwrap(HashRouter.prototype as unknown as HashRouterPatchTarget, '_setRoute');
    }
}
