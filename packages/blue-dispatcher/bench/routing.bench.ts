/**
 * @author opencode
 *
 * Benchmark suite for `MetadataHandlerMapping` route resolution throughput.
 *
 * Scenarios:
 *   1. Static route match          – GET /users
 *   2. Parameterised route match   – GET /users/42  (pattern: /users/:id)
 *   3. Deep nested route match     – GET /api/v1/users/42/profile
 *   4. Route miss                  – /nonexistent  (no handler registered)
 *   5. Multi-handler scan          – rotate through three distinct routes
 */

import { bench, describe } from 'vitest';
import '@tsmetadata/polyfill';
import { MetadataHandlerMapping } from '../src/route-handler-mapping';
import { MetadataConfigApplicationContext, configuration, entry, ApplicationContextAwareProcessor } from '@blue/context';
import { routeMapping } from '../src/route-mapping';

/* ------------------------------------------------------------------ */
/*  Test controller                                                     */
/* ------------------------------------------------------------------ */

@routeMapping()
class BenchController {
    @routeMapping('/users')
    listUsers() {}

    @routeMapping('/users/:id')
    getUser() {}

    @routeMapping('/api/v1/users/:id/profile')
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
        return [new MetadataHandlerMapping()];
    }
}

/* ------------------------------------------------------------------ */
/*  One-time context setup (module level – not per-iteration)          */
/* ------------------------------------------------------------------ */

const ctx = new MetadataConfigApplicationContext('bench');
ctx.addProcessor(new ApplicationContextAwareProcessor(ctx));
ctx.register(BenchConfig);

const handlerMapping = new MetadataHandlerMapping();
handlerMapping.setApplicationContext(ctx);

/* ------------------------------------------------------------------ */
/*  Route fixtures (minimal shape that satisfies getHandler)           */
/* ------------------------------------------------------------------ */

const routeUsers    = { path: '/users'                       } as any;
const routeUserId   = { path: '/users/42'                    } as any;
const routeProfile  = { path: '/api/v1/users/42/profile'     } as any;
const routeMiss     = { path: '/nonexistent'                  } as any;
const multiRoutes   = [routeUsers, routeUserId, routeProfile] as const;

let _sink = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

describe('MetadataHandlerMapping – static route match (/users)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeUsers) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('MetadataHandlerMapping – parameterised route match (/users/42)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeUserId) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('MetadataHandlerMapping – deep nested route match (/api/v1/users/42/profile)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeProfile) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('MetadataHandlerMapping – route miss (/nonexistent)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            accumulator += handlerMapping.getHandler(routeMiss) ? 1 : 0;
        }
        _sink = accumulator;
    });
});

describe('MetadataHandlerMapping – multi-handler rotation (3 routes × 1000)', () => {
    bench('getHandler', () => {
        let accumulator = 0;
        for (let i = 0; i < 1000; i++) {
            for (const route of multiRoutes) {
                accumulator += handlerMapping.getHandler(route) ? 1 : 0;
            }
        }
        _sink = accumulator;
    });
});
