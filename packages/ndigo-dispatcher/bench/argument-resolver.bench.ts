/**
 * Argument resolution throughput.
 *
 * Two layers: selector lookup (`Array.find` vs a hypothetical type-keyed Map)
 * and full `RouteHandlerMethod.invoke`. The Map rows bound the selector
 * overhead; they are not a drop-in replacement because the resolver contract is
 * a predicate, not a type key. Extracted values are verified before timing.
 */
import { test } from 'vitest';
import type { Route } from '../../ndigo-router/src';
import '@tsmetadata/polyfill';
import { routeMapping } from '../src/route-mapping';
import { RouteHandlerMethod } from '../src/route-handler-method';
import {
    AttributeValueMethodArgumentResolver,
    HandlerMethodArgumentResolver,
    MatrixValueMethodArgumentResolver,
    PathValueMethodArgumentResolver,
    QueryValueMethodArgumentResolver,
} from '../src/argument-resolver';
import { MethodParameter, MethodParameterType } from '../src/parameters';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

@routeMapping()
class BenchController {
    @routeMapping('/no-params')
    noParams() {
        return 'ok';
    }

    @routeMapping('/users/:id')
    withPathParam(id?: string) {
        return id;
    }

    @routeMapping('/search')
    withQueryParam(name?: string) {
        return name;
    }

    @routeMapping('/api/:id/data')
    withMixedParams(id?: string, name?: string, token?: string) {
        return `${id}|${name}|${token}`;
    }

    @routeMapping('/many')
    withManyParams(...values: (string | undefined)[]) {
        return values.join('|');
    }
}

const controller = new BenchController();

const defaultResolvers: HandlerMethodArgumentResolver[] = [
    new PathValueMethodArgumentResolver(),
    new MatrixValueMethodArgumentResolver(),
    new QueryValueMethodArgumentResolver(),
    new AttributeValueMethodArgumentResolver(),
];

const resolverMap = new Map<MethodParameterType, HandlerMethodArgumentResolver>([
    [MethodParameterType.PATH, new PathValueMethodArgumentResolver()],
    [MethodParameterType.MATRIX, new MatrixValueMethodArgumentResolver()],
    [MethodParameterType.QUERY, new QueryValueMethodArgumentResolver()],
    [MethodParameterType.ATTRIBUTE, new AttributeValueMethodArgumentResolver()],
]);

const pathParam = new MethodParameter(MethodParameterType.PATH, 'id');
const queryParam = new MethodParameter(MethodParameterType.QUERY, 'name');
const attrParam = new MethodParameter(MethodParameterType.ATTRIBUTE, 'token');
const manyParams = Array.from(
    { length: 10 },
    (_, index) => new MethodParameter(MethodParameterType.QUERY, `q${index}`)
);

const routeWithPath = { path: '/users/42', params: { id: '42' }, data: {}, attributes: {} } as unknown as Route;
const routeWithQuery = { path: '/search', params: null, data: { name: 'Alice' }, attributes: {} } as unknown as Route;
const routeWithAll = {
    path: '/api/42/data',
    params: { id: '42' },
    data: { name: 'Alice' },
    attributes: { token: 'xyz' },
} as unknown as Route;
const routeWithMany = {
    path: '/many',
    params: null,
    data: Object.fromEntries(manyParams.map((parameter, index) => [parameter.name, `v${index}`])),
    attributes: {},
} as unknown as Route;

const noParamMethod = new RouteHandlerMethod(controller, 'noParams');
noParamMethod.parameters = [];
noParamMethod.argumentResolvers = defaultResolvers;

const pathParamMethod = new RouteHandlerMethod(controller, 'withPathParam');
pathParamMethod.parameters = [pathParam];
pathParamMethod.argumentResolvers = defaultResolvers;

const queryParamMethod = new RouteHandlerMethod(controller, 'withQueryParam');
queryParamMethod.parameters = [queryParam];
queryParamMethod.argumentResolvers = defaultResolvers;

const mixedParamMethod = new RouteHandlerMethod(controller, 'withMixedParams');
mixedParamMethod.parameters = [pathParam, queryParam, attrParam];
mixedParamMethod.argumentResolvers = defaultResolvers;

const manyParamMethod = new RouteHandlerMethod(controller, 'withManyParams');
manyParamMethod.parameters = manyParams;
manyParamMethod.argumentResolvers = defaultResolvers;

function resolverName(resolver: HandlerMethodArgumentResolver | undefined): string | null {
    return resolver ? resolver.constructor.name : null;
}

test('resolver lookup — path param', async ({ bench }) => {
    assertEquivalent(
        'path resolver selector',
        resolverName(defaultResolvers.find((resolver) => resolver.supportsParameter(pathParam))),
        resolverName(resolverMap.get(pathParam.type))
    );
    await bench.compare(
        bench(benchName('Array.find + supportsParameter', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                retain(defaultResolvers.find((resolver) => resolver.supportsParameter(pathParam)));
            }
        }),
        bench(benchName('Map.get(type) — hypothetical', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(resolverMap.get(pathParam.type));
        })
    );
});

test('resolver lookup — query param', async ({ bench }) => {
    assertEquivalent(
        'query resolver selector',
        resolverName(defaultResolvers.find((resolver) => resolver.supportsParameter(queryParam))),
        resolverName(resolverMap.get(queryParam.type))
    );
    await bench.compare(
        bench(benchName('Array.find + supportsParameter', BATCH), () => {
            for (let i = 0; i < BATCH; i++) {
                retain(defaultResolvers.find((resolver) => resolver.supportsParameter(queryParam)));
            }
        }),
        bench(benchName('Map.get(type) — hypothetical', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(resolverMap.get(queryParam.type));
        })
    );
});

test('invoke — zero parameters', async ({ bench }) => {
    assertEquivalent('invoke zero params', noParamMethod.invoke(routeWithPath), 'ok');
    await bench(benchName('invoke()', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(noParamMethod.invoke(routeWithPath));
    }).run();
});

test('invoke — one path parameter', async ({ bench }) => {
    assertEquivalent('invoke path param', pathParamMethod.invoke(routeWithPath), '42');
    await bench(benchName('invoke()', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(pathParamMethod.invoke(routeWithPath));
    }).run();
});

test('invoke — one query parameter', async ({ bench }) => {
    assertEquivalent('invoke query param', queryParamMethod.invoke(routeWithQuery), 'Alice');
    await bench(benchName('invoke()', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(queryParamMethod.invoke(routeWithQuery));
    }).run();
});

test('invoke — three mixed parameters', async ({ bench }) => {
    assertEquivalent('invoke mixed params', mixedParamMethod.invoke(routeWithAll), '42|Alice|xyz');
    await bench(benchName('invoke()', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(mixedParamMethod.invoke(routeWithAll));
    }).run();
});

test('invoke — ten query parameters', async ({ bench }) => {
    assertEquivalent(
        'invoke ten params',
        manyParamMethod.invoke(routeWithMany),
        manyParams.map((_, index) => `v${index}`).join('|')
    );
    await bench(benchName('invoke()', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(manyParamMethod.invoke(routeWithMany));
    }).run();
});
