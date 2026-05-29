/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { routeMapping, routeParams, queryValue, bodyValue, pathValue } from '@blue/dispatcher';

/**
 * Demonstration controller for the Node.js platform demo.
 * Handles greeting and echo routes under /api.
 */
@routeMapping('/api')
export class GreetingController {
    /**
     * Returns a greeting for the given name.
     * GET /api/hello?name=<name>
     */
    @routeMapping('/hello')
    @routeParams({ name: queryValue('name') })
    hello(name: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    /**
     * Echoes the request body back to the caller.
     * POST /api/echo
     */
    @routeMapping('/echo')
    @routeParams({ payload: bodyValue('*') })
    echo(payload: unknown) {
        return { echo: payload };
    }

    /**
     * Returns the given path segment.
     * GET /api/greet/:name
     */
    @routeMapping('/greet/:name')
    @routeParams({ name: pathValue('name') })
    greet(name: string) {
        return { greeting: `Greetings, ${name}!` };
    }
}