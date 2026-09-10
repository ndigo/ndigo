/**
 *
 * Benchmark suite for `RadixMetadataHandlerMapping` route resolution throughput.
 * Includes external baselines: find-my-way and radix3.
 *
 * Scenarios:
 *   1. Static route match          – GET /users
 *   2. Parameterised route match   – GET /users/42  (pattern: /users/:id)
 *   3. Deep nested route match     – GET /api/v1/users/42/profile
 *   4. Route miss                  – /nonexistent  (no handler registered)
 *   5. Multi-handler scan          – rotate through three distinct routes
 */

import { bench, describe } from 'vitest';
import { type Route } from '@blue/router';
import '@tsmetadata/polyfill';
import { RadixMetadataHandlerMapping } from '../src/route-handler-mapping';
import {
    MetadataConfigApplicationContext,
    configuration,
    entry,
    ApplicationContextAwareProcessor,
} from '@blue/context';
import { routeMapping } from '../src/route-mapping';
import Router from 'find-my-way';
import { createRouter } from 'radix3';

/* ------------------------------------------------------------------ */
/*  Test controller                                                     */
/* ------------------------------------------------------------------ */

@routeMapping()
class BenchController {
    @routeMapping('/users')
    listUsers() {}

    @routeMapping('/users/*')
    getUser() {}

    @routeMapping('/api/v1/users/*/profile')
    getUserProfile() {}
}

@configuration
class BenchConfig {
    @entry
    benchController() {
        return new BenchController();
    }

    @entry
    handlerMappings() {
        return [new RadixMetadataHandlerMapping()];
    }
}

/* ------------------------------------------------------------------ */
/*  One-time context setup (module level – not per-iteration)          */
/* ------------------------------------------------------------------ */

const ctx = new MetadataConfigApplicationContext('bench');
ctx.addProcessor(new ApplicationContextAwareProcessor(ctx));
ctx.register(BenchConfig);
ctx.refresh();

const handlerMapping = new RadixMetadataHandlerMapping();
handlerMapping.setApplicationContext(ctx);
handlerMapping.init();

const radixHandlerMapping = new RadixMetadataHandlerMapping();
radixHandlerMapping.setApplicationContext(ctx);
radixHandlerMapping.init();

/* ------------------------------------------------------------------ */
/*  External routers setup                                               */
/* ------------------------------------------------------------------ */

const fmw = Router();
fmw.on('GET', '/users', () => {});
fmw.on('GET', '/users/:id', () => {});
fmw.on('GET', '/api/v1/users/:id/profile', () => {});

const r3 = createRouter();
r3.insert('/users', { handler: () => {} });
r3.insert('/users/:id', { handler: () => {} });
r3.insert('/api/v1/users/:id/profile', { handler: () => {} });

/* ------------------------------------------------------------------ */
/*  Route fixtures (minimal shape that satisfies getHandler)           */
/* ------------------------------------------------------------------ */

const routeUsers = { path: '/users' } as unknown as Route;
const routeUserId = { path: '/users/42' } as unknown as Route;
const routeProfile = { path: '/api/v1/users/42/profile' } as unknown as Route;
const routeMiss = { path: '/nonexistent' } as unknown as Route;
const multiRoutes = [routeUsers, routeUserId, routeProfile] as const;

let _sink = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

describe('RadixMetadataHandlerMapping – static route match (/users)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeUsers) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('RadixMetadataHandlerMapping', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += radixHandlerMapping.getHandler(routeUsers) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('find-my-way', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += fmw.find('GET', '/users') ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('radix3', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += r3.lookup('/users') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('RadixMetadataHandlerMapping – parameterised route match (/users/42)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeUserId) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('RadixMetadataHandlerMapping', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += radixHandlerMapping.getHandler(routeUserId) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('find-my-way', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += fmw.find('GET', '/users/42') ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('radix3', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += r3.lookup('/users/42') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('RadixMetadataHandlerMapping – deep nested route match (/api/v1/users/42/profile)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeProfile) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('RadixMetadataHandlerMapping', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += radixHandlerMapping.getHandler(routeProfile) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('find-my-way', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += fmw.find('GET', '/api/v1/users/42/profile') ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('radix3', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += r3.lookup('/api/v1/users/42/profile') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('RadixMetadataHandlerMapping – route miss (/nonexistent)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeMiss) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('RadixMetadataHandlerMapping', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += radixHandlerMapping.getHandler(routeMiss) ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('find-my-way', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += fmw.find('GET', '/nonexistent') ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('radix3', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += r3.lookup('/nonexistent') ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('RadixMetadataHandlerMapping – multi-handler rotation (3 routes × 1000)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const route of multiRoutes) {
                accumulator += handlerMapping.getHandler(route) ? 1 : 0;
            }
        }
        _sink = accumulator;
    });

    bench('RadixMetadataHandlerMapping', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const route of multiRoutes) {
                accumulator += radixHandlerMapping.getHandler(route) ? 1 : 0;
            }
        }
        _sink = accumulator;
    });

    bench('find-my-way', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += fmw.find('GET', '/users') ? 1 : 0;
            accumulator += fmw.find('GET', '/users/42') ? 1 : 0;
            accumulator += fmw.find('GET', '/api/v1/users/42/profile') ? 1 : 0;
        }
        _sink = accumulator;
    });

    bench('radix3', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += r3.lookup('/users') ? 1 : 0;
            accumulator += r3.lookup('/users/42') ? 1 : 0;
            accumulator += r3.lookup('/api/v1/users/42/profile') ? 1 : 0;
        }
        _sink = accumulator;
    });
});
