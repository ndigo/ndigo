/**
 * Minimal demonstration controller using the node platform's HTTP method.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, socketMapping, socketSessionValue, type SocketSession, requestMapping } from '@ndigo/dispatcher';
import { queryValue, parameters } from '@ndigo/dispatcher';

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
    @parameters({ name: queryValue('name') })
    greetByName(name?: string) {
        return { message: `Hello, ${name || 'World'}!` };
    }

    @socketMapping('/echo')
    @parameters({ session: socketSessionValue('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}
