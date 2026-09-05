/**
 * @author Jeff Rose
 *
 * Benchmark suite for RadixTree lookup.
 * Compares against flat Map<string,string> and RegExp array baselines.
 * No external routing libraries — @blue/core has no such devDependencies.
 *
 * Scenarios:
 *   1. Static route match        – /users
 *   2. Param route match         – /users/42
 *   3. Deep nested param route   – /api/v1/users/42/profile
 *   4. Two-param route           – /api/v1/users/42/posts/7
 *   5. Route miss                – /nonexistent
 *   6. Mixed rotation            – 3 routes × 1000
 *   7. Scale – 20 routes         – 3 lookup paths × 1000
 *   8. Scale – 50 routes         – 3 lookup paths × 1000
 *   9. Scale – 100 routes        – 3 lookup paths × 1000
 */
import { bench, describe } from 'vitest';
import { RadixTree } from '../src/radix-tree';

// Flat Map with only static routes
const staticMap = new Map<string, string>([
    ['/users', 'listUsers'],
    ['/health', 'health'],
    ['/api/v1/metrics', 'metrics'],
]);

// RegExp array covering all routes
const regexpRoutes: [RegExp, string][] = [
    [/^\/users$/, 'listUsers'],
    [/^\/users\/(?<id>[^/]+)$/, 'getUser'],
    [/^\/api\/v1\/users\/(?<id>[^/]+)\/profile$/, 'getUserProfile'],
    [/^\/api\/v1\/users\/(?<userId>[^/]+)\/posts\/(?<postId>[^/]+)$/, 'getUserPost'],
    [/^\/health$/, 'health'],
    [/^\/api\/v1\/metrics$/, 'metrics'],
];

const tree = new RadixTree<string>();

// Register all routes in the RadixTree
tree.insert('/users', 'listUsers');
tree.insert('/users/:id', 'getUser');
tree.insert('/api/v1/users/:id/profile', 'getUserProfile');
tree.insert('/api/v1/users/:userId/posts/:postId', 'getUserPost');
tree.insert('/health', 'health');
tree.insert('/api/v1/metrics', 'metrics');

// Build scale fixture function
function buildScaleFixture(n: number): { tree: RadixTree<string>; regexps: [RegExp, string][] } {
    const resources = [
        'tags',
        'categories',
        'orders',
        'products',
        'reviews',
        'notifications',
        'messages',
        'events',
        'teams',
        'projects',
        'tasks',
        'files',
        'reports',
        'invoices',
        'payments',
        'subscriptions',
        'members',
        'roles',
        'permissions',
        'settings',
    ];

    const tree = new RadixTree<string>();
    const regexps: [RegExp, string][] = [];

    // Generate filler routes first
    let routeCount = 0;
    for (let i = 0; i < n - 3 && routeCount < n - 3; i++) {
        const resource = resources[i % resources.length];

        // Add static list route
        if (routeCount < n - 3) {
            tree.insert(`/${resource}`, `${resource}List`);
            regexps.push([new RegExp(`^\\/${resource}$`), `${resource}List`]);
            routeCount++;
        }

        // Add single param route
        if (routeCount < n - 3) {
            tree.insert(`/${resource}/:id`, `${resource}Get`);
            regexps.push([new RegExp(`^\\/${resource}\\/(?<id>[^/]+)$`), `${resource}Get`]);
            routeCount++;
        }

        // Add nested static route
        if (routeCount < n - 3) {
            tree.insert(`/${resource}/:id/items`, `${resource}Items`);
            regexps.push([new RegExp(`^\\/${resource}\\/(?<id>[^/]+)\\/items$`), `${resource}Items`]);
            routeCount++;
        }

        // Add nested two-param route
        if (routeCount < n - 3) {
            tree.insert(`/${resource}/:id/items/:itemId`, `${resource}Item`);
            regexps.push([new RegExp(`^\\/${resource}\\/(?<id>[^/]+)\\/items\\/(?<itemId>[^/]+)$`), `${resource}Item`]);
            routeCount++;
        }
    }

    // Add anchor routes last (so they're at the end of regexp array)
    tree.insert('/users/:id', 'getUser');
    regexps.push([/^\/users\/(?<id>[^/]+)$/, 'getUser']);

    tree.insert('/posts/:id/comments/:commentId', 'getPostComment');
    regexps.push([/^\/posts\/(?<id>[^/]+)\/comments\/(?<commentId>[^/]+)$/, 'getPostComment']);

    tree.insert('/articles', 'listArticles');
    regexps.push([/^\/articles$/, 'listArticles']);

    return { tree, regexps };
}

// Scale fixtures
const fix20 = buildScaleFixture(20);
const fix50 = buildScaleFixture(50);
const fix100 = buildScaleFixture(100);

describe('RadixTree lookup performance', () => {
    describe('static route match – /users', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = tree.lookup('/users');
            }
        });
        bench('Map.get (flat)', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = staticMap.get('/users');
            }
        });
    });

    describe('param route match – /users/42', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = tree.lookup('/users/42');
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of regexpRoutes) {
                    const m = re.exec('/users/42');
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
    });

    describe('deep nested param route – /api/v1/users/42/profile', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = tree.lookup('/api/v1/users/42/profile');
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of regexpRoutes) {
                    const m = re.exec('/api/v1/users/42/profile');
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
        bench('Map.get (exact miss then regexp)', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                const result = staticMap.get('/api/v1/users/42/profile');
                if (result === undefined) {
                    for (const [re, handler] of regexpRoutes) {
                        const m = re.exec('/api/v1/users/42/profile');
                        if (m) {
                            _sink = { value: handler, params: m.groups ?? null };
                            break;
                        }
                    }
                } else {
                    _sink = result;
                }
            }
        });
    });

    describe('two-param route – /api/v1/users/42/posts/7', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = tree.lookup('/api/v1/users/42/posts/7');
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of regexpRoutes) {
                    const m = re.exec('/api/v1/users/42/posts/7');
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
    });

    describe('route miss – /nonexistent', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = tree.lookup('/nonexistent');
            }
        });
        bench('Map.get (miss)', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                _sink = staticMap.get('/nonexistent');
            }
        });
        bench('RegExp array scan (full miss)', () => {
            let _sink: any;
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of regexpRoutes) {
                    const m = re.exec('/nonexistent');
                    if (m) {
                        _sink = handler;
                        break;
                    }
                }
            }
        });
    });

    describe('mixed rotation – 3 routes × 1000', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            const routes = ['/users', '/users/42', '/api/v1/users/42/profile'];
            for (let i = 0; i < 1000; i++) {
                const route = routes[i % routes.length];
                _sink = tree.lookup(route);
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            const routes = ['/users', '/users/42', '/api/v1/users/42/profile'];
            for (let i = 0; i < 1000; i++) {
                const route = routes[i % routes.length];
                for (const [re, handler] of regexpRoutes) {
                    const m = re.exec(route);
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
    });

    // ─── Scale benchmarks ───────────────────────────────────────────────

    describe('scale – 20 routes', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (let i = 0; i < 1000; i++) {
                _sink = fix20.tree.lookup(paths[i % 3]);
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of fix20.regexps) {
                    const m = re.exec(paths[i % 3]);
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
    });

    describe('scale – 50 routes', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (let i = 0; i < 1000; i++) {
                _sink = fix50.tree.lookup(paths[i % 3]);
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of fix50.regexps) {
                    const m = re.exec(paths[i % 3]);
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
    });

    describe('scale – 100 routes', () => {
        bench('RadixTree.lookup', () => {
            let _sink: any;
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (let i = 0; i < 1000; i++) {
                _sink = fix100.tree.lookup(paths[i % 3]);
            }
        });
        bench('RegExp array scan', () => {
            let _sink: any;
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (let i = 0; i < 1000; i++) {
                for (const [re, handler] of fix100.regexps) {
                    const m = re.exec(paths[i % 3]);
                    if (m) {
                        _sink = { value: handler, params: m.groups ?? null };
                        break;
                    }
                }
            }
        });
    });
});
