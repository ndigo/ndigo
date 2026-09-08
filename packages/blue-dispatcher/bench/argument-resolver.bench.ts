/**
 *
 * Benchmark suite for argument resolution throughput.
 *
 * Two layers are measured separately:
 *
 *   1. Resolver lookup — `argumentResolvers.find()` (current) vs `Map.get()` (potential
 *      optimisation) for a single parameter.  This isolates the selector overhead from the
 *      actual data-extraction work.
 *
 *   2. Full `RouteHandlerMethod.invoke()` — end-to-end cost including the `getRouteMapping`
 *      call, `new Array(n)` allocation, and the handler dispatch, across three handler shapes:
 *        a. 0 params  – baseline invocation cost with no argument resolution
 *        b. 1 path param  – PATH is index 0 in the default resolver list (best-case find)
 *        c. 1 query param – QUERY is index 2 in the default resolver list (slower find)
 *        d. 3 mixed params – path + query + attribute (worst-case find, 3 × scan)
 *
 * Key things to watch for:
 *   - Gap between find() and Map.get() reveals how much the linear resolver scan costs.
 *   - Gap between 0-param and N-param invoke() is the pure argument-resolution overhead.
 *   - Any unexpectedly large gap between b and c points to resolver-ordering issues.
 */

import { bench, describe } from 'vitest';
import '@tsmetadata/polyfill';
import { routeMapping } from '../src/route-mapping';
import { RouteHandlerMethod } from '../src/route-handler-method';
import {
    PathValueMethodArgumentResolver,
    QueryValueMethodArgumentResolver,
    AttributeValueMethodArgumentResolver,
    MatrixValueMethodArgumentResolver,
    HandlerMethodArgumentResolver,
} from '../src/argument-resolver';
import { MethodParameter, MethodParameterType } from '../src/parameters';

/* ------------------------------------------------------------------ */
/*  Handler under test                                                  */
/* ------------------------------------------------------------------ */

@routeMapping()
class BenchController {
    @routeMapping('/no-params')
    noParams() {
        return 'ok';
    }

    @routeMapping('/users/:id')
    withPathParam() {
        return 'ok';
    }

    @routeMapping('/search')
    withQueryParam() {
        return 'ok';
    }

    @routeMapping('/api/:id/data')
    withMixedParams() {
        return 'ok';
    }
}

/* ------------------------------------------------------------------ */
/*  Shared fixtures                                                     */
/* ------------------------------------------------------------------ */

const controller = new BenchController();

// Default resolver list – same order as MetadataHandlerAdapter.defaultArgumentResolvers
const defaultResolvers: HandlerMethodArgumentResolver[] = [
    new PathValueMethodArgumentResolver(),
    new MatrixValueMethodArgumentResolver(),
    new QueryValueMethodArgumentResolver(),
    new AttributeValueMethodArgumentResolver(),
];

// Pre-indexed Map – potential optimisation: O(1) lookup by type
const resolverMap = new Map<MethodParameterType, HandlerMethodArgumentResolver>([
    [MethodParameterType.PATH, new PathValueMethodArgumentResolver()],
    [MethodParameterType.MATRIX, new MatrixValueMethodArgumentResolver()],
    [MethodParameterType.QUERY, new QueryValueMethodArgumentResolver()],
    [MethodParameterType.ATTRIBUTE, new AttributeValueMethodArgumentResolver()],
]);

// Pre-built MethodParameter instances
const pathParam = new MethodParameter(MethodParameterType.PATH, 'id');
const queryParam = new MethodParameter(MethodParameterType.QUERY, 'name');
const attrParam = new MethodParameter(MethodParameterType.ATTRIBUTE, 'token');

// Route fixtures
const routeWithPath = { path: '/users/42', params: { id: '42' }, data: {}, attributes: {} } as any;
const routeWithQuery = { path: '/search', params: null, data: { name: 'Alice' }, attributes: {} } as any;
const routeWithAll = {
    path: '/api/42/data',
    params: { id: '42' },
    data: { name: 'Alice' },
    attributes: { token: 'xyz' },
} as any;

// RouteHandlerMethod instances
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

let _sink: any = 0;

/* ------------------------------------------------------------------ */
/*  1. Resolver lookup in isolation                                     */
/* ------------------------------------------------------------------ */

describe('resolver lookup – path param (find vs Map)', () => {
    bench('Array.find()', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const r = defaultResolvers.find((resolver) => resolver.supportsParameter(pathParam));
            accumulator += r ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('Map.get()', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const r = resolverMap.get(pathParam.type);
            accumulator += r ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('resolver lookup – query param (find vs Map)', () => {
    bench('Array.find()', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const r = defaultResolvers.find((resolver) => resolver.supportsParameter(queryParam));
            accumulator += r ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('Map.get()', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            const r = resolverMap.get(queryParam.type);
            accumulator += r ? 1 : 0;
        }
        _sink = accumulator;
    });
});

/* ------------------------------------------------------------------ */
/*  2. Full RouteHandlerMethod.invoke()                                 */
/* ------------------------------------------------------------------ */

describe('invoke() – 0 params (baseline)', () => {
    bench('invoke', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += noParamMethod.invoke(routeWithPath) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('invoke() – 1 path param (find index 0)', () => {
    bench('invoke', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += pathParamMethod.invoke(routeWithPath) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('invoke() – 1 query param (find index 2)', () => {
    bench('invoke', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += queryParamMethod.invoke(routeWithQuery) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('invoke() – 3 mixed params (path + query + attribute)', () => {
    bench('invoke', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += mixedParamMethod.invoke(routeWithAll) ? 1 : 0;
        }
        _sink = accumulator;
    });
});
