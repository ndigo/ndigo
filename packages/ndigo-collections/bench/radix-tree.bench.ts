/**
 * RadixTree lookup against a flat Map (static paths) and a RegExp scan.
 *
 * The RegExp rows are a lower-bound alternative, not a router: they cover the
 * same routes and extract the same named parameters. Every scenario verifies
 * handler and parameter equality before timing. One iteration performs 1,000
 * lookups (`@ops=1000`).
 */
import { describe, test } from 'vitest';
import { RadixTree } from '../src/radix-tree';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const OPS = 1_000;
const retain = sink;

const staticMap = new Map<string, string>([
    ['/users', 'listUsers'],
    ['/health', 'health'],
    ['/api/v1/metrics', 'metrics'],
]);

const regexpRoutes: [RegExp, string][] = [
    [/^\/users$/, 'listUsers'],
    [/^\/users\/(?<id>[^/]+)$/, 'getUser'],
    [/^\/api\/v1\/users\/(?<id>[^/]+)\/profile$/, 'getUserProfile'],
    [/^\/api\/v1\/users\/(?<userId>[^/]+)\/posts\/(?<postId>[^/]+)$/, 'getUserPost'],
    [/^\/health$/, 'health'],
    [/^\/api\/v1\/metrics$/, 'metrics'],
];

const tree = new RadixTree<string>();
tree.insert('/users', 'listUsers');
tree.insert('/users/:id', 'getUser');
tree.insert('/api/v1/users/:id/profile', 'getUserProfile');
tree.insert('/api/v1/users/:userId/posts/:postId', 'getUserPost');
tree.insert('/health', 'health');
tree.insert('/api/v1/metrics', 'metrics');

interface Result {
    handler: string;
    params: Record<string, string> | null;
}

function scan(routes: [RegExp, string][], path: string): Result | null {
    for (const [regexp, handler] of routes) {
        const match = regexp.exec(path);
        if (match) return { handler, params: match.groups ? Object.fromEntries(Object.entries(match.groups)) : null };
    }
    return null;
}

function paramsOf(value: Record<string, string> | null): Record<string, string> | null {
    return value ? Object.fromEntries(Object.entries(value)) : null;
}

function fromTree(path: string): Result | null {
    const match = tree.lookup(path);
    return match ? { handler: match.value, params: paramsOf(match.params) } : null;
}

function verify(path: string): void {
    assertEquivalent(`radix ${path}`, fromTree(path), scan(regexpRoutes, path));
}

function buildScaleFixture(count: number): { tree: RadixTree<string>; regexps: [RegExp, string][] } {
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
    const scaleTree = new RadixTree<string>();
    const regexps: [RegExp, string][] = [];
    let routes = 0;
    for (let i = 0; routes < count - 3; i++) {
        const resource = resources[i % resources.length];
        const entries: [string, string, RegExp][] = [
            [`/${resource}`, `${resource}List`, new RegExp(`^\\/${resource}$`)],
            [`/${resource}/:id`, `${resource}Get`, new RegExp(`^\\/${resource}\\/(?<id>[^/]+)$`)],
            [`/${resource}/:id/items`, `${resource}Items`, new RegExp(`^\\/${resource}\\/(?<id>[^/]+)\\/items$`)],
            [
                `/${resource}/:id/items/:itemId`,
                `${resource}Item`,
                new RegExp(`^\\/${resource}\\/(?<id>[^/]+)\\/items\\/(?<itemId>[^/]+)$`),
            ],
        ];
        for (const [pattern, handler, regexp] of entries) {
            if (routes >= count - 3) break;
            scaleTree.insert(pattern, handler);
            regexps.push([regexp, handler]);
            routes++;
        }
    }
    scaleTree.insert('/users/:id', 'getUser');
    regexps.push([/^\/users\/(?<id>[^/]+)$/, 'getUser']);
    scaleTree.insert('/posts/:id/comments/:commentId', 'getPostComment');
    regexps.push([/^\/posts\/(?<id>[^/]+)\/comments\/(?<commentId>[^/]+)$/, 'getPostComment']);
    scaleTree.insert('/articles', 'listArticles');
    regexps.push([/^\/articles$/, 'listArticles']);
    return { tree: scaleTree, regexps };
}

const fix20 = buildScaleFixture(20);
const fix50 = buildScaleFixture(50);
const fix100 = buildScaleFixture(100);

function verifyScale(
    label: string,
    fixture: { tree: RadixTree<string>; regexps: [RegExp, string][] },
    path: string
): void {
    const match = fixture.tree.lookup(path);
    assertEquivalent(
        `${label} ${path}`,
        match ? { handler: match.value, params: paramsOf(match.params) } : null,
        scan(fixture.regexps, path)
    );
}

describe('RadixTree lookup performance', () => {
    test('static route match — /users', async ({ bench }) => {
        verify('/users');
        await bench.compare(
            bench(benchName('RadixTree.lookup', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(tree.lookup('/users'));
            }),
            bench(benchName('Map.get (flat)', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(staticMap.get('/users'));
            })
        );
    });

    test('param route match — /users/42', async ({ bench }) => {
        verify('/users/42');
        await bench.compare(
            bench(benchName('RadixTree.lookup', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(tree.lookup('/users/42'));
            }),
            bench(benchName('RegExp array scan', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(scan(regexpRoutes, '/users/42'));
            })
        );
    });

    test('deep nested param route — /api/v1/users/42/profile', async ({ bench }) => {
        verify('/api/v1/users/42/profile');
        await bench.compare(
            bench(benchName('RadixTree.lookup', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(tree.lookup('/api/v1/users/42/profile'));
            }),
            bench(benchName('RegExp array scan', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(scan(regexpRoutes, '/api/v1/users/42/profile'));
            }),
            bench(benchName('Map.get (exact miss then regexp)', OPS), () => {
                for (let i = 0; i < OPS; i++) {
                    const exact = staticMap.get('/api/v1/users/42/profile');
                    retain(exact ?? scan(regexpRoutes, '/api/v1/users/42/profile'));
                }
            })
        );
    });

    test('two-param route — /api/v1/users/42/posts/7', async ({ bench }) => {
        verify('/api/v1/users/42/posts/7');
        await bench.compare(
            bench(benchName('RadixTree.lookup', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(tree.lookup('/api/v1/users/42/posts/7'));
            }),
            bench(benchName('RegExp array scan', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(scan(regexpRoutes, '/api/v1/users/42/posts/7'));
            })
        );
    });

    test('route miss — /nonexistent', async ({ bench }) => {
        verify('/nonexistent');
        await bench.compare(
            bench(benchName('RadixTree.lookup', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(tree.lookup('/nonexistent'));
            }),
            bench(benchName('Map.get (miss)', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(staticMap.get('/nonexistent'));
            }),
            bench(benchName('RegExp array scan (full miss)', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(scan(regexpRoutes, '/nonexistent'));
            })
        );
    });

    test('mixed rotation — three routes', async ({ bench }) => {
        const paths = ['/users', '/users/42', '/api/v1/users/42/profile'];
        for (const path of paths) verify(path);
        await bench.compare(
            bench(benchName('RadixTree.lookup', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(tree.lookup(paths[i % paths.length]));
            }),
            bench(benchName('RegExp array scan', OPS), () => {
                for (let i = 0; i < OPS; i++) retain(scan(regexpRoutes, paths[i % paths.length]));
            })
        );
    });

    for (const [label, fixture] of [
        ['20 routes', fix20],
        ['50 routes', fix50],
        ['100 routes', fix100],
    ] as const) {
        test(`scale — ${label}`, async ({ bench }) => {
            const paths = ['/articles', '/users/42', '/posts/99/comments/7'];
            for (const path of paths) verifyScale(label, fixture, path);
            await bench.compare(
                bench(benchName('RadixTree.lookup', OPS), () => {
                    for (let i = 0; i < OPS; i++) retain(fixture.tree.lookup(paths[i % paths.length]));
                }),
                bench(benchName('RegExp array scan', OPS), () => {
                    for (let i = 0; i < OPS; i++) retain(scan(fixture.regexps, paths[i % paths.length]));
                })
            );
        });
    }
});
