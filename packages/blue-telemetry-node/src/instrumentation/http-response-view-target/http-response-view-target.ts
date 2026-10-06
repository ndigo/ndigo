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
                kind: SpanKind.SERVER,
                attributes: (_instance: unknown, args: unknown[]) => {
                    const output = args[0];
                    const model = args[1] as { constructor?: { name?: string } } | undefined;
                    return {
                        'http.response.output': typeof output === 'string' ? 'text' : 'json',
                        ...(model?.constructor?.name === 'ResponseEntity'
                            ? {
                                  'http.status_code': String(
                                      (model as { status?: { code?: number } }).status?.code ?? 200
                                  ),
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
