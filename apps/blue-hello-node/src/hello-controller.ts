/**
 * Minimal demonstration controller using the node platform's HTTP method
 * decorators.
 *
 * @module
 */

import '@tsmetadata/polyfill';
import { getMapping } from '@blue/dispatcher';
import { queryValue, routeParams } from '@blue/dispatcher';

/**
 * Serves a JSON greeting.
 *
 * - `GET /` → `{ message: "Hello, Node!" }`
 * - `GET /hello?name=X` → `{ message: "Hello, X!" }`
 */
@getMapping('/')
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
}