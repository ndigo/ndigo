/**
 * OpenTelemetry instrumentation for `HTTPServer` lifecycle.
 *
 * Creates spans for `listen` and `close`, giving visibility into server startup
 * and shutdown. Inbound request handling is traced by `DispatcherInstrumentation`
 * (dispatch) and `HTTPResponseViewTargetInstrumentation` (response write), so this
 * instrumentation covers only the server lifecycle boundaries.
 *
 * @module
 * @since 1.0.0
 */

import { SpanKind } from '@opentelemetry/api';
import { HTTPServer } from '@blue/platform-node';
import { BaseBlueInstrumentation } from '../base';

/**
 * Instrumentation for `HTTPServer.listen` and `HTTPServer.close`.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *   instrumentations: [new HTTPServerInstrumentation()],
 * });
 * ```
 */
export class HTTPServerInstrumentation extends BaseBlueInstrumentation {
    constructor() {
        super('http-server');
    }

    enable(): void {
        this._wrap(
            HTTPServer.prototype,
            'start',
            this._patchAsync({
                name: 'HTTPServer.start',
                kind: SpanKind.SERVER,
                attributes: (instance: HTTPServer) => ({
                    'server.port': instance.port,
                }),
            })
        );

        this._wrap(
            HTTPServer.prototype,
            'close',
            this._patchAsync({
                name: 'HTTPServer.close',
                kind: SpanKind.INTERNAL,
                attributes: (instance: HTTPServer) => ({
                    'server.port': instance.port,
                }),
            })
        );
    }

    disable(): void {
        this._unwrap(HTTPServer.prototype, 'start');
        this._unwrap(HTTPServer.prototype, 'close');
    }
}