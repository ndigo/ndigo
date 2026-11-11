/**
 * OpenTelemetry instrumentation for the `@ndigo/http` client.
 */
import { SpanKind } from '@opentelemetry/api';
import { HTTP } from '@ndigo/http';
import { AbstractBaseInstrumentation } from '../base';

/**
 * An OpenTelemetry instrumentation for the `@ndigo/http` client.
 *
 * Wraps `HTTP#request` so every outbound request produces a CLIENT span
 * carrying the method, target URL, response status, and duration. Child
 * spans of the request (transforms, fetch) nest under it.
 */
export class HTTPClientInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('http-client');
    }

    /**
     * Patches `HTTP#request` to record outbound request spans.
     */
    enable(): void {
        this._wrap(
            HTTP.prototype,
            'request',
            this._patch({
                name: 'HTTP.request',
                kind: SpanKind.CLIENT,
                attributes: (_instance: unknown, args: unknown[]) => {
                    const input = args[0];
                    const init = (args[1] ?? {}) as { method?: string } | null;
                    return {
                        'http.request.method': (init?.method ?? 'GET').toUpperCase(),
                        'url.full': typeof input === 'string' ? input : String(input),
                    };
                },
                onEnd(span, outcome, _instance, args) {
                    if (outcome.ok) {
                        const response = outcome.value as { status?: number } | undefined;
                        if (response?.status !== undefined) {
                            span.setAttribute('http.response.status_code', response.status);
                        }
                    } else {
                        span.setAttribute('error.type', 'http');
                    }
                },
                // eslint-disable-next-line typescript/no-explicit-any
            }) as any
        );
    }

    /**
     * Restores the original `request` method.
     */
    disable(): void {
        this._unwrap(HTTP.prototype, 'request');
    }
}
