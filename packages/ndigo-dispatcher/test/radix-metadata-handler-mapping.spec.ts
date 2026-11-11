import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { type Route, type RouteSegment } from '@ndigo/router';
import RouteHandlerExecutionChain from '../src/route-handler-execution-chain';
import { RouteHandlerMethod } from '../src/route-handler-method';
import { routeMapping } from '../src/route-mapping';
import { canonicalizeRouteMappingPath, RadixMetadataHandlerMapping } from '../src/radix-metadata-handler-mapping';
import { getMethodNotAllowed } from '../src/route-handler-denial';
import { HTTPMethodCondition } from '../src/http-method-condition';
import {
    MatrixParamCondition,
    PatternsRouteCondition,
    QueryParamCondition,
    RouteMappingInfo,
} from '../src/route-mapping-info';

/** Resolve a matched route's handler as the {@link RouteHandlerMethod} the mapping registered. */
const handlerOf = (chain: RouteHandlerExecutionChain | null): RouteHandlerMethod =>
    (chain as NonNullable<typeof chain>).handler as RouteHandlerMethod;

describe('RadixMetadataHandlerMapping', () => {
    let ctx: GenericApplicationContext;

    beforeEach(() => {
        ctx = new GenericApplicationContext('test');
    });

    afterEach(() => {
        ctx.destroy();
    });

    test('static route resolves handler', () => {
        @routeMapping('/hello')
        class StaticController {
            @routeMapping('/world')
            world() {
                return 'ok';
            }
        }

        ctx.setValue('staticController', new StaticController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/hello/world' } as unknown as Route);
        expect(chain).not.toBeNull();
        expect(handlerOf(chain).method).toBe('world');
    });

    test('base-class-declared route resolves on a bare subclass', () => {
        @routeMapping('/hello')
        class BaseController {
            @routeMapping('/world')
            world() {
                return 'ok';
            }
        }

        class SubController extends BaseController {}

        ctx.setValue('subController', new SubController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/hello/world' } as unknown as Route);
        expect(chain).not.toBeNull();
        expect(handlerOf(chain).method).toBe('world');
    });

    test('parameterized route :id resolves handler', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/:id')
            getUser() {
                return 'user';
            }
        }

        ctx.setValue('usersController', new UsersController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/users/42' } as unknown as Route);
        expect(chain).not.toBeNull();
    });

    test('parameterized route {id} resolves handler', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/{id}')
            getUser() {
                return 'user';
            }
        }

        ctx.setValue('usersController', new UsersController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/users/42' } as unknown as Route);
        expect(chain).not.toBeNull();
    });

    test('route queryParams set on route object', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/:id')
            getUser() {
                return 'user';
            }
        }

        ctx.setValue('usersController', new UsersController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const route = { path: '/users/42', params: null };
        mapping.getHandler(route as unknown as Route);

        expect(route.params).toEqual({ id: '42' });
    });

    test('route pattern set on route object', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/:id')
            getUser() {
                return 'user';
            }
        }

        ctx.setValue('usersController', new UsersController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const route = { path: '/users/42' } as unknown as Route;
        mapping.getHandler(route);

        expect(route.pattern).toBe('/users/:id');
    });

    test('route pattern is an own enumerable property', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/:id')
            getUser() {
                return 'user';
            }
        }

        ctx.setValue('usersController', new UsersController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const route = { path: '/users/42' } as unknown as Route;
        mapping.getHandler(route);

        // Plain assignment keeps the route a fast-mode object; the property is
        // visible to Object.keys/spread (the old defineProperty hid it).
        expect(Object.keys(route)).toContain('pattern');
        expect({ ...route }).toMatchObject({ pattern: '/users/:id' });
    });

    test('method mismatch records a 405 Allow value', () => {
        @routeMapping('/only-get')
        class OnlyGetController {
            @routeMapping({ value: '/method', method: 'GET', private: false })
            read() {
                return 'read';
            }
        }

        ctx.setValue('onlyGetController', new OnlyGetController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const route = { path: '/only-get/method', method: 'POST' } as unknown as Route;
        expect(mapping.getHandler(route)).toBeNull();
        expect(getMethodNotAllowed(route)).toBe('GET');
    });

    test('a failed non-method condition produces 404, not 405', () => {
        @routeMapping('/conditional')
        class ConditionalController {
            @routeMapping({ value: '/method', method: 'GET', queryParams: 'filter=active', private: false })
            read() {
                return 'read';
            }
        }

        ctx.setValue('conditionalController', new ConditionalController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const route = { path: '/conditional/method', method: 'POST', data: {} } as unknown as Route;
        expect(mapping.getHandler(route)).toBeNull();
        expect(getMethodNotAllowed(route)).toBeNull();
    });

    test('HEAD request resolves a GET-only mapping', () => {
        @routeMapping('/only-get')
        class OnlyGetController {
            @routeMapping({ value: '/method', method: 'GET', private: false })
            read() {
                return 'read';
            }
        }

        ctx.setValue('onlyGetController', new OnlyGetController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const route = { path: '/only-get/method', method: 'HEAD' } as unknown as Route;
        expect(mapping.getHandler(route)).not.toBeNull();
        expect(route.pattern).toBe('/only-get/method');
    });

    test('no match returns null', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/:id')
            getUser() {
                return 'user';
            }
        }

        ctx.setValue('usersController', new UsersController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/nonexistent' } as unknown as Route);
        expect(chain).toBeNull();
    });

    test('wildcard route * resolves handler', () => {
        @routeMapping('/api')
        class APIController {
            @routeMapping('/*')
            handle() {
                return 'ok';
            }
        }

        ctx.setValue('apiController', new APIController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/api/anything' } as unknown as Route);
        expect(chain).not.toBeNull();
    });

    test('multiple routes, correct one selected', () => {
        @routeMapping('/users')
        class UsersController {
            @routeMapping('/:id')
            getUser() {
                return 'user';
            }
        }

        @routeMapping('/posts')
        class PostsController {
            @routeMapping('/:id')
            getPost() {
                return 'post';
            }
        }

        ctx.setValue('usersController', new UsersController());
        ctx.setValue('postsController', new PostsController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        // Test users controller
        let chain = mapping.getHandler({ path: '/users/1' } as unknown as Route);
        expect(chain).not.toBeNull();
        expect(handlerOf(chain).method).toBe('getUser');

        // Test posts controller
        chain = mapping.getHandler({ path: '/posts/2' } as unknown as Route);
        expect(chain).not.toBeNull();
        expect(handlerOf(chain).method).toBe('getPost');
    });

    describe('normalized duplicate registrations (DSV-DISP-2/3)', () => {
        // Pre-fix these pairs silently shadowed each other: the radix tree
        // collapses both spellings to one node, but candidates were keyed by
        // the raw pattern, so only the last-inserted pattern's handlers were
        // ever looked up.
        const get = (mapping: RadixMetadataHandlerMapping, path: string, which: string) =>
            mapping.getHandler({ path, data: { which }, length: 0 } as unknown as Route);

        test('`/dup/:id` and `/dup/{id}` both stay reachable', () => {
            @routeMapping('/dup')
            class ColonController {
                @routeMapping({ value: '/:id', queryParams: 'which=colon', private: false })
                colon() {
                    return 'colon';
                }
            }
            @routeMapping('/dup')
            class BraceController {
                @routeMapping({ value: '/{id}', queryParams: 'which=brace', private: false })
                brace() {
                    return 'brace';
                }
            }

            ctx.setValue('colonController', new ColonController());
            ctx.setValue('braceController', new BraceController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            expect(handlerOf(get(mapping, '/dup/42', 'colon')).method).toBe('colon');
            expect(handlerOf(get(mapping, '/dup/42', 'brace')).method).toBe('brace');
        });

        test('`/dup/:id` and `/dup/:id/` both stay reachable', () => {
            @routeMapping('/dup')
            class NoSlashController {
                @routeMapping({ value: '/:id', queryParams: 'which=no-slash', private: false })
                noSlash() {
                    return 'no-slash';
                }
            }
            @routeMapping('/dup')
            class SlashController {
                @routeMapping({ value: '/:id/', queryParams: 'which=slash', private: false })
                slash() {
                    return 'slash';
                }
            }

            ctx.setValue('noSlashController', new NoSlashController());
            ctx.setValue('slashController', new SlashController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            expect(handlerOf(get(mapping, '/dup/42', 'no-slash')).method).toBe('noSlash');
            expect(handlerOf(get(mapping, '/dup/42', 'slash')).method).toBe('slash');
        });
    });

    describe('query/matrix param conditions', () => {
        test('handler selected when queryParams condition matches query string', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/:id', queryParams: 'filter=active', private: false })
                getItem() {
                    return 'item';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('itemsController', new ItemsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route = { path: '/items/1', data: { filter: 'active' }, length: 0 };
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when queryParams condition does not match', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/:id', queryParams: 'filter=active', private: false })
                getItem() {
                    return 'item';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('itemsController', new ItemsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route = { path: '/items/1', data: { filter: 'inactive' }, length: 0 };
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).toBeNull();
        });

        test('handler selected when matrixParams condition matches segment data', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color=red', private: false })
                getProduct() {
                    return 'product';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('productsController', new ProductsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route: Route = { path: '/products/42', length: 1, data: {}, queryParams: null } as unknown as Route;
            route[0] = { data: { color: 'red' } } as unknown as RouteSegment;
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when matrixParams condition does not match', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color=red', private: false })
                getProduct() {
                    return 'product';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('productsController', new ProductsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route: Route = { path: '/products/42', length: 1, data: {}, queryParams: null } as unknown as Route;
            route[0] = { data: { color: 'ndigo' } } as unknown as RouteSegment;
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).toBeNull();
        });

        test('handler selected when queryParams condition matches query string', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/*', queryParams: 'filter=active', private: false })
                getItem() {
                    return 'item';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('itemsController', new ItemsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route = { path: '/items/1', data: { filter: 'active' }, length: 0 };
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when queryParams condition does not match', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/*', queryParams: 'filter=active', private: false })
                getItem() {
                    return 'item';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('itemsController', new ItemsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route = { path: '/items/1', data: { filter: 'inactive' }, length: 0 };
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).toBeNull();
        });

        test('handler selected when matrixParams condition matches segment data', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/*', matrixParams: 'color=red', private: false })
                getProduct() {
                    return 'product';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('productsController', new ProductsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route: Route = { path: '/products/42', length: 1, data: {}, queryParams: null } as unknown as Route;
            route[0] = { data: { color: 'red' } } as unknown as RouteSegment;
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when matrixParams condition does not match', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/*', matrixParams: 'color=red', private: false })
                getProduct() {
                    return 'product';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('productsController', new ProductsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route: Route = { path: '/products/42', length: 1, data: {}, queryParams: null } as unknown as Route;
            route[0] = { data: { color: 'ndigo' } } as unknown as RouteSegment;
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).toBeNull();
        });

        test('Radix: more-specific handler (matrixParams) wins when condition matches', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color', private: false })
                getProductColored() {
                    return 'colored';
                }

                @routeMapping('/:id')
                getProduct() {
                    return 'plain';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('productsController', new ProductsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            const route: Route = { path: '/products/42', length: 1, data: {}, queryParams: null } as unknown as Route;
            route[0] = { data: { color: 'red' } } as unknown as RouteSegment;
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).not.toBeNull();
            expect(handlerOf(chain).method).toBe('getProductColored');
        });

        test('Radix: fallback handler wins when specific condition does not match', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color', private: false })
                getProductColored() {
                    return 'colored';
                }

                @routeMapping('/:id')
                getProduct() {
                    return 'plain';
                }
            }

            const ctx = new GenericApplicationContext('test');
            ctx.setValue('productsController', new ProductsController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            // No matrix segments — the color condition should fail, fallback wins
            const route: Route = { path: '/products/42', length: 0, data: {}, queryParams: null } as unknown as Route;
            const chain = mapping.getHandler(route as unknown as Route);
            expect(chain).not.toBeNull();
            expect(handlerOf(chain).method).toBe('getProduct');
        });
    });
});

describe('canonicalizeRouteMappingPath (REU-3)', () => {
    test('folds spellings the radix tree collapses to one node', () => {
        // empty segments are dropped
        expect(canonicalizeRouteMappingPath('/a')).toBe('/a');
        expect(canonicalizeRouteMappingPath('/a/')).toBe('/a');
        expect(canonicalizeRouteMappingPath('//a')).toBe('/a');
        // `{name}` and `:name` are one param node
        expect(canonicalizeRouteMappingPath('/a/:id')).toBe('/a/:id');
        expect(canonicalizeRouteMappingPath('/a/{id}')).toBe('/a/:id');
        // greedy labels are canonicalized as `*:<label>`
        expect(canonicalizeRouteMappingPath('/a/{*rest}')).toBe('/a/*:rest');
        expect(canonicalizeRouteMappingPath('/a/**')).toBe('/a/*:');
        // the degenerate `{*}` and `**` pair share the empty greedy label
        expect(canonicalizeRouteMappingPath('/a/{*}')).toBe(canonicalizeRouteMappingPath('/a/**'));
    });

    test('keeps distinct param labels and greedy kinds in separate buckets', () => {
        expect(canonicalizeRouteMappingPath('/a/:id')).not.toBe(canonicalizeRouteMappingPath('/a/:userId'));
        expect(canonicalizeRouteMappingPath('/a/{*rest}')).not.toBe(canonicalizeRouteMappingPath('/a/**'));
        // a bare `*` wildcard is distinct from the greedy `**`
        expect(canonicalizeRouteMappingPath('/a/*')).not.toBe(canonicalizeRouteMappingPath('/a/**'));
    });

    test('the canonicalizer and real registration agree across the spelling table', () => {
        const groups: Array<{ spellings: string[]; path: string }> = [
            { spellings: ['/a', '/a/', '//a'], path: '/a' },
            { spellings: ['/a/:id', '/a/{id}'], path: '/a/42' },
            { spellings: ['/a/{*}', '/a/**'], path: '/a/x/y' },
        ];

        for (const { spellings, path } of groups) {
            // The canonicalizer folds every spelling in the group to one key...
            expect(new Set(spellings.map((spelling) => canonicalizeRouteMappingPath(spelling))).size).toBe(1);

            // ...and real registration agrees: every spelling stays reachable,
            // disambiguated by its own query condition, proving they share one
            // radix candidate bucket rather than shadowing each other.
            const mapping = new RadixMetadataHandlerMapping();
            const handlers = spellings.map((spelling, index) => {
                const handler = { handle: () => spelling };
                const info = new RouteMappingInfo(
                    null,
                    new PatternsRouteCondition(spelling),
                    new QueryParamCondition(`which=${index}`),
                    new MatrixParamCondition(),
                    null,
                    null,
                    new HTTPMethodCondition()
                );
                mapping.registerMapping(info, handler, 'handle');
                return handler;
            });

            spellings.forEach((_spelling, index) => {
                const route = { path, data: { which: String(index) }, length: 0 } as unknown as Route;
                const chain = mapping.getHandler(route as unknown as Route);
                // The radix mapping wraps each registered handler in a RouteHandlerMethod.
                const mappedHandler = chain?.handler as RouteHandlerMethod | undefined;
                expect(mappedHandler?.handler).toBe(handlers[index]);
            });
        }
    });
});
