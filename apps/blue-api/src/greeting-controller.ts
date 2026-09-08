/**
 * Demonstration controller for the Node.js platform demo.
 * Handles greeting and echo routes under /api.
 */
import '@tsmetadata/polyfill';
import { getMapping, postMapping, parameters, queryValue, bodyValue, pathVariable, requestMapping } from '@blue/dispatcher';

@requestMapping('/api')
export class GreetingController {
    /**
     * Returns a greeting for the given name.
     * GET /api/hello?name=<name>
     */
    @getMapping('/hello')
    @parameters({ name: queryValue('name') })
    hello(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    /**
     * Echoes the request body back to the caller.
     * POST /api/echo
     */
    @postMapping('/echo')
    @parameters({ payload: bodyValue('*') })
    echo(payload: unknown) {
        return { echo: payload };
    }

    /**
     * Returns the given path segment.
     * GET /api/greet/:name
     */
    @getMapping('/greet/:name')
    @parameters({ name: pathVariable('name') })
    greet(name: string) {
        return { greeting: `Greetings, ${name}!` };
    }
}
