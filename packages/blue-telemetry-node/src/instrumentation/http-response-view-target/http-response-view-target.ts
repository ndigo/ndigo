/**
 * OpenTelemetry instrumentation for `HTTPResponseViewTarget.commit`.
 * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind } from '@opentelemetry/api';
import { HTTPResponseViewTarget } from '@blue/platform-node';
import { AbstractBaseInstrumentation } from '@blue/telemetry';

/**
 * Instrumentation for `HTTPResponseViewTarget.commit`.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *   instrumentations: [new HTTPResponseViewTargetInstrumentation()],
 * });
 * ```
 */
export class HTTPResponseViewTargetInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('http-response-view-target');
    }

    enable(): void {
        this._wrap(
            HTTPResponseViewTarget.prototype,
            'commit',
            this._patch({
                name: 'HTTPResponseViewTarget.commit',
                // Committing a rendered view is internal lifecycle work; the
                // inbound HTTP request owns the SERVER boundary (TEL-11).
                kind: SpanKind.INTERNAL,
                attributes: (_instance: unknown, args: unknown[]) => {
                    const output = args[0];
                    // `commit(output, model)` — the model owns the response
                    // status when it is an `ResponseEntity`.
                    const model = args[1] as
                        | { constructor?: { name?: string }; status?: { code?: number } }
                        | undefined;
                    return {
                        'http.response.output': typeof output === 'string' ? 'text' : 'json',
                        ...(model?.constructor?.name === 'ResponseEntity'
                            ? {
                                  // Numeric semconv key/type (was
                                  // `http.status_code` string) — TEL-11.
                                  'http.response.status_code': model.status?.code ?? 200,
                              }
                            : {}),
                    };
                },
            })
        );
    }

    disable(): void {
        this._unwrap(HTTPResponseViewTarget.prototype, 'commit');
    }
}
