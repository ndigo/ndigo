/**
 * Demonstration controller for the Node.js platform demo.
 * Handles greeting and echo routes under /api.
 */
import '@tsmetadata/polyfill';
import { getMapping, postMapping, routeParams, queryValue, bodyValue, pathValue, requestMapping } from '@blue/dispatcher';

@requestMapping('/api')
export class GreetingController {
    /**
     * Returns a greeting for the given name.
     * GET /api/hello?name=<name>
     */
    @getMapping('/hello')
    @routeParams({ name: queryValue('name') })
    hello(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    /**
     * Echoes the request body back to the caller.
     * POST /api/echo
     */
    @postMapping('/echo')
    @routeParams({ payload: bodyValue('*') })
    echo(payload: unknown) {
        return { echo: payload };
    }

    /**
     * Returns the given path segment.
     * GET /api/greet/:name
     */
    @getMapping('/greet/:name')
    @routeParams({ name: pathValue('name') })
    greet(name: string) {
        return { greeting: `Greetings, ${name}!` };
    }
}
