import '@tsmetadata/polyfill';

import { describe, test, expect } from 'vitest';
import { Route } from '@ndigo/router';
import { ErrorHandlerMethod, RouteHandlerMethod } from '../src/route-handler-method';
import { type HandlerMethodArgumentResolver } from '../src/argument-resolver';
import { MethodParameter, MethodParameterType } from '../src/parameters';
import { routeMapping } from '../src/route-mapping';

describe('RouteHandlerMethod', () => {
    const foobar = { foo: () => true, bar: () => false },
        route = {} as unknown as Route;

    test('it should initialize with a handler', () => {
        const foo = new RouteHandlerMethod(foobar, 'foo'),
            bar = new RouteHandlerMethod(foobar, 'bar');
        expect(foo.invoke(route)).toBe(true);
        expect(bar.invoke(route)).toBe(false);
    });

    test('invokes a zero-parameter handler without consulting resolvers', () => {
        const handler = { ping: (...args: unknown[]) => args.length },
            method = new RouteHandlerMethod(handler, 'ping');
        method.parameters = [];
        method.argumentResolvers = [];

        expect(method.invoke(route)).toBe(0);
    });

    test('passes the same cached mapping to resolvers on every invoke', () => {
        @routeMapping('/items')
        class Controller {
            @routeMapping('/:id')
            get(id?: string) {
                return id;
            }
        }

        const controller = new Controller(),
            seen: unknown[] = [],
            resolver: HandlerMethodArgumentResolver = {
                supportsParameter: (parameter) => parameter.type === MethodParameterType.PATH,
                resolveArgument: (parameter, currentRoute, mapping) => {
                    seen.push(mapping);
                    return (currentRoute.params as Record<string, string> | null)?.[parameter.name];
                },
            },
            method = new RouteHandlerMethod(controller, 'get');
        method.parameters = [new MethodParameter(MethodParameterType.PATH, 'id')];
        method.argumentResolvers = [resolver];

        const itemRoute = { path: '/items/42', params: { id: '42' } } as unknown as Route;
        expect(method.invoke(itemRoute)).toBe('42');
        expect(method.invoke(itemRoute)).toBe('42');
        expect(seen).toHaveLength(2);
        expect(seen[0]).toBe(seen[1]);
        expect(seen[0]).toMatchObject({ value: '/:id' });
    });

    test('ErrorHandlerMethod invokes a zero-parameter error handler unchanged', () => {
        const handler = { onError: (...args: unknown[]) => (args.length === 0 ? 'handled' : 'unexpected') },
            method = new ErrorHandlerMethod(handler, 'onError');

        expect(method.invoke(route, new Error('boom'), new RouteHandlerMethod(handler, 'onError'))).toBe('handled');
    });
});
