
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { type Route, type RouteSegment } from '@ndigo/router';
import RouteHandlerExecutionChain from '../src/route-handler-execution-chain';
import { RouteHandlerMethod } from '../src/route-handler-method';
import { routeMapping } from '../src/route-mapping';
import { RadixMetadataHandlerMapping } from '../src/radix-metadata-handler-mapping';

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

        const route = { path: '/users/42' };
        mapping.getHandler(route as unknown as Route);

        expect((route as unknown as { pattern: string }).pattern).toBe('/users/:id');
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

        // Test with RadixMetadataHandlerMapping as well
        // Note: RadixMetadataHandlerMapping uses GlobPathMatcher, which does not understand
        // :param segments — use /* wildcards instead.
        test('handler selected when queryParams condition matches query string (Linear)', () => {
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

        test('handler rejected when queryParams condition does not match (Linear)', () => {
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

        test('handler selected when matrixParams condition matches segment data (Linear)', () => {
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

        test('handler rejected when matrixParams condition does not match (Linear)', () => {
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
