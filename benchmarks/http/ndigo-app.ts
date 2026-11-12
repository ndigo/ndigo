/**
 * Ndigo end-to-end HTTP benchmark app.
 *
 * Run through `pnpm exec tsx benchmarks/http/ndigo-app.ts`; the framework
 * packages are built to `lib/` first. The routes match the Fastify, Express,
 * and Hono apps in this directory.
 */
import 'node:process';
import '@tsmetadata/polyfill';
import { bodyValue, getMapping, parameters, pathVariable, postMapping, requestMapping } from '@ndigo/dispatcher';
import { createNodeApplication } from '@ndigo/platform-node';
import { configuration, entry } from '@ndigo/context';

@requestMapping('/')
class BenchController {
    @getMapping('/json')
    json() {
        return { message: 'hello' };
    }

    @getMapping('/users/:id')
    @parameters({ id: pathVariable('id') })
    user(id?: string) {
        return { id };
    }

    @postMapping('/echo')
    @parameters({ body: bodyValue() })
    echo(body: unknown) {
        return body;
    }
}

@configuration
class BenchConfiguration {
    @entry()
    benchController() {
        return new BenchController();
    }
}

const app = await createNodeApplication([BenchConfiguration], { port: Number(process.env.PORT ?? 4313) });
console.log(`ndigo listening on ${app.port}`);
