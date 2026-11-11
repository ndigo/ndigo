/**
 * Route resolution benchmarks in two deliberately separate modes.
 *
 * **Parity** — `RadixTree.lookup` against find-my-way and radix3 with identical
 * `:param` routes. Handler and parameter extraction are verified before timing.
 *
 * **Full resolution** — `RadixMetadataHandlerMapping.getHandler`, which adds
 * candidate filtering, route conditions, mapping selection, and pattern
 * decoration. This mode has no external comparator because the other routers do
 * not implement those semantics.
 */
import { test } from 'vitest';
import type { Route } from '../../ndigo-router/src';
import '@tsmetadata/polyfill';
import { RadixMetadataHandlerMapping } from '../src/route-handler-mapping';
import { routeMapping } from '../src/route-mapping';
import {
    MetadataConfigApplicationContext,
    ApplicationContextAwareProcessor,
    configuration,
    entry,
} from '../../ndigo-context/src';
import { RadixTree } from '../../ndigo-core/src/radix-tree';
import Router from 'find-my-way';
import { createRouter } from 'radix3';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const OPS = 1_000;
const retain = sink;

/* ------------------------------------------------------------------ */
/*  Full-resolution fixture                                             */
/* ------------------------------------------------------------------ */

@routeMapping('/')
class BenchController {
    @routeMapping('/users')
    listUsers() {}

    @routeMapping('/users/*')
    getUser() {}

    @routeMapping('/api/v1/users/*/profile')
    getUserProfile() {}

    @routeMapping({ value: '/method', method: 'GET', private: false })
    methodConstrained() {}
}

@configuration
class BenchConfig {
    @entry()
    benchController() {
        return new BenchController();
    }

    @entry()
    handlerMappings() {
        return [new RadixMetadataHandlerMapping()];
    }
}

const ctx = new MetadataConfigApplicationContext('bench');
ctx.addProcessor(new ApplicationContextAwareProcessor(ctx));
ctx.register(BenchConfig);
ctx.refresh();

const handlerMapping = new RadixMetadataHandlerMapping();
handlerMapping.setApplicationContext(ctx);
handlerMapping.init();

const routeUsers = { path: '/users' } as unknown as Route;
const routeUserId = { path: '/users/42' } as unknown as Route;
const routeProfile = { path: '/api/v1/users/42/profile' } as unknown as Route;
const routeMethod = { path: '/method', method: 'GET' } as unknown as Route;
const routeMethodMismatch = { path: '/method', method: 'POST' } as unknown as Route;
const routeMiss = { path: '/nonexistent' } as unknown as Route;
const multiRoutes = [routeUsers, routeUserId, routeProfile] as const;

/** Verifies full resolution once before its scenarios are timed. */
function verifyFull(route: Route, expectedPattern: string | null): void {
    const handler = handlerMapping.getHandler(route);
    assertEquivalent(
        `full resolution ${route.path}`,
        handler ? 'handler' : null,
        expectedPattern === null ? null : 'handler'
    );
    if (expectedPattern !== null) {
        assertEquivalent(`full pattern ${route.path}`, route.pattern, expectedPattern);
    }
}

verifyFull(routeUsers, '/users');
verifyFull(routeUserId, '/users/*');
verifyFull(routeProfile, '/api/v1/users/*/profile');
verifyFull(routeMethod, '/method');
verifyFull(routeMethodMismatch, null);
verifyFull(routeMiss, null);

/* ------------------------------------------------------------------ */
/*  Parity fixture                                                      */
/* ------------------------------------------------------------------ */

const usersHandler = (): string => 'users';
const userHandler = (): string => 'user';
const profileHandler = (): string => 'profile';

const parityTree = new RadixTree<Function>();
parityTree.insert('/users', usersHandler);
parityTree.insert('/users/:id', userHandler);
parityTree.insert('/api/v1/users/:id/profile', profileHandler);

const fmw = Router();
fmw.on('GET', '/users', usersHandler);
fmw.on('GET', '/users/:id', userHandler);
fmw.on('GET', '/api/v1/users/:id/profile', profileHandler);

const radix3 = createRouter();
radix3.insert('/users', { handler: usersHandler });
radix3.insert('/users/:id', { handler: userHandler });
radix3.insert('/api/v1/users/:id/profile', { handler: profileHandler });

interface Lookup {
    handler: string;
    params: Record<string, string> | null;
}

function handlerName(handler: unknown): string {
    return typeof handler === 'function' ? handler.name : String(handler);
}

function paramsOf(value: Record<string, string | undefined> | null | undefined): Record<string, string> | null {
    if (!value) return null;
    const entries: [string, string][] = [];
    for (const [key, candidate] of Object.entries(value)) {
        if (candidate !== undefined) entries.push([key, candidate]);
    }
    return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function fromTree(path: string): Lookup | null {
    const match = parityTree.lookup(path);
    return match ? { handler: handlerName(match.value), params: paramsOf(match.params) } : null;
}

function fromFindMyWay(path: string): Lookup | null {
    const match = fmw.find('GET', path);
    return match ? { handler: handlerName(match.handler), params: paramsOf(match.params) } : null;
}

function fromRadix3(path: string): Lookup | null {
    const match = radix3.lookup(path);
    return match ? { handler: handlerName(match.handler), params: paramsOf(match.params) } : null;
}

function verifyParity(path: string): void {
    const tree = fromTree(path);
    assertEquivalent(`find-my-way parity ${path}`, fromFindMyWay(path), tree);
    assertEquivalent(`radix3 parity ${path}`, fromRadix3(path), tree);
}

for (const path of ['/users', '/users/42', '/api/v1/users/42/profile', '/nonexistent']) verifyParity(path);

/* ------------------------------------------------------------------ */
/*  Full-resolution scenarios                                           */
/* ------------------------------------------------------------------ */

test('full resolution — static route', async ({ bench }) => {
    await bench(benchName('getHandler(/users)', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler(routeUsers));
    }).run();
});

test('full resolution — parameterised route', async ({ bench }) => {
    await bench(benchName('getHandler(/users/42)', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler(routeUserId));
    }).run();
});

test('full resolution — deep nested route', async ({ bench }) => {
    await bench(benchName('getHandler(/api/v1/users/42/profile)', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler(routeProfile));
    }).run();
});

test('full resolution — route miss', async ({ bench }) => {
    await bench(benchName('getHandler(/nonexistent)', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler(routeMiss));
    }).run();
});

test('full resolution — fresh route object', async ({ bench }) => {
    // Production adapters build a fresh route per request; this exposes the
    // hidden-class cost of decorating it with a non-enumerable property.
    await bench(benchName('getHandler(/users) — fresh route', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler({ path: '/users' } as unknown as Route));
    }).run();
});

test('full resolution — method-constrained route', async ({ bench }) => {
    await bench(benchName('getHandler(/method GET)', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler(routeMethod));
    }).run();
});

test('full resolution — 405 method mismatch', async ({ bench }) => {
    await bench(benchName('getHandler(/method POST) — 405', OPS), () => {
        for (let i = 0; i < OPS; i++) {
            retain(handlerMapping.getHandler({ path: '/method', method: 'POST' } as unknown as Route));
        }
    }).run();
});

test('full resolution — three-route rotation', async ({ bench }) => {
    await bench(benchName('getHandler rotation', OPS), () => {
        for (let i = 0; i < OPS; i++) retain(handlerMapping.getHandler(multiRoutes[i % multiRoutes.length]));
    }).run();
});

/* ------------------------------------------------------------------ */
/*  Parity scenarios                                                    */
/* ------------------------------------------------------------------ */

test('parity — static route', async ({ bench }) => {
    await bench.compare(
        bench(benchName('RadixTree.lookup', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromTree('/users'));
        }),
        bench(benchName('find-my-way', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromFindMyWay('/users'));
        }),
        bench(benchName('radix3', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromRadix3('/users'));
        })
    );
});

test('parity — parameterised route', async ({ bench }) => {
    await bench.compare(
        bench(benchName('RadixTree.lookup', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromTree('/users/42'));
        }),
        bench(benchName('find-my-way', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromFindMyWay('/users/42'));
        }),
        bench(benchName('radix3', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromRadix3('/users/42'));
        })
    );
});

test('parity — deep nested route', async ({ bench }) => {
    await bench.compare(
        bench(benchName('RadixTree.lookup', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromTree('/api/v1/users/42/profile'));
        }),
        bench(benchName('find-my-way', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromFindMyWay('/api/v1/users/42/profile'));
        }),
        bench(benchName('radix3', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromRadix3('/api/v1/users/42/profile'));
        })
    );
});

test('parity — route miss', async ({ bench }) => {
    await bench.compare(
        bench(benchName('RadixTree.lookup', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromTree('/nonexistent'));
        }),
        bench(benchName('find-my-way', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromFindMyWay('/nonexistent'));
        }),
        bench(benchName('radix3', OPS), () => {
            for (let i = 0; i < OPS; i++) retain(fromRadix3('/nonexistent'));
        })
    );
});
