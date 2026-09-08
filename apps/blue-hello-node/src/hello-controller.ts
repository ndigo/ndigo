/**
 * Minimal demonstration controller using the node platform's HTTP method
 * decorators.
 *
 * @module
 */

import '@tsmetadata/polyfill';
import { getMapping, socketMapping, type SocketSession, requestMapping } from '@blue/dispatcher';
import { queryValue, routeParams } from '@blue/dispatcher';

/**
 * Serves a JSON greeting and a WebSocket echo endpoint.
 *
 * - `GET /` → `{ message: "Hello, Node!" }`
 * - `GET /hello?name=X` → `{ message: "Hello, X!" }`
 * - `WS /echo` → echoes each received message as `{ event: 'echo', data }`
 */
@requestMapping('/')
export class HelloController {
    @getMapping('/')
    greet() {
        return { message: 'Hello, Node!' };
    }

    @getMapping('/hello')
    @routeParams({ name: queryValue('name') })
    greetByName(name?: string) {
        return { message: `Hello, ${name || 'World'}!` };
    }

    @socketMapping('/echo')
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}
