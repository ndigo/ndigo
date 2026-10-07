/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { type Route } from '@blue/router';
import { routeMapping } from '../src/route-mapping';
import { RadixMetadataHandlerMapping } from '../src/radix-metadata-handler-mapping';

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
        expect(chain.handler.method).toBe('world');
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
        expect(chain.handler.method).toBe('world');
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
        expect(chain.handler.method).toBe('getUser');

        // Test posts controller
        chain = mapping.getHandler({ path: '/posts/2' } as unknown as Route);
        expect(chain).not.toBeNull();
        expect(chain.handler.method).toBe('getPost');
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
                @routeMapping({ value: '/:id', queryParams: 'which=colon' })
                colon() {
                    return 'colon';
                }
            }
            @routeMapping('/dup')
            class BraceController {
                @routeMapping({ value: '/{id}', queryParams: 'which=brace' })
                brace() {
                    return 'brace';
                }
            }

            ctx.setValue('colonController', new ColonController());
            ctx.setValue('braceController', new BraceController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            expect(get(mapping, '/dup/42', 'colon')?.handler.method).toBe('colon');
            expect(get(mapping, '/dup/42', 'brace')?.handler.method).toBe('brace');
        });

        test('`/dup/:id` and `/dup/:id/` both stay reachable', () => {
            @routeMapping('/dup')
            class NoSlashController {
                @routeMapping({ value: '/:id', queryParams: 'which=no-slash' })
                noSlash() {
                    return 'no-slash';
                }
            }
            @routeMapping('/dup')
            class SlashController {
                @routeMapping({ value: '/:id/', queryParams: 'which=slash' })
                slash() {
                    return 'slash';
                }
            }

            ctx.setValue('noSlashController', new NoSlashController());
            ctx.setValue('slashController', new SlashController());

            const mapping = new RadixMetadataHandlerMapping();
            mapping.setApplicationContext(ctx);
            mapping.init();

            expect(get(mapping, '/dup/42', 'no-slash')?.handler.method).toBe('noSlash');
            expect(get(mapping, '/dup/42', 'slash')?.handler.method).toBe('slash');
        });
    });

    describe('query/matrix param conditions', () => {
        test('handler selected when queryParams condition matches query string', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/:id', queryParams: 'filter=active' })
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
            const chain = mapping.getHandler(route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when queryParams condition does not match', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/:id', queryParams: 'filter=active' })
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
            const chain = mapping.getHandler(route);
            expect(chain).toBeNull();
        });

        test('handler selected when matrixParams condition matches segment data', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color=red' })
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
            route[0] = { data: { color: 'red' } };
            const chain = mapping.getHandler(route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when matrixParams condition does not match', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color=red' })
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
            route[0] = { data: { color: 'blue' } };
            const chain = mapping.getHandler(route);
            expect(chain).toBeNull();
        });

        test('handler selected when queryParams condition matches query string', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/*', queryParams: 'filter=active' })
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
            const chain = mapping.getHandler(route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when queryParams condition does not match', () => {
            @routeMapping('/items')
            class ItemsController {
                @routeMapping({ value: '/*', queryParams: 'filter=active' })
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
            const chain = mapping.getHandler(route);
            expect(chain).toBeNull();
        });

        test('handler selected when matrixParams condition matches segment data', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/*', matrixParams: 'color=red' })
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
            route[0] = { data: { color: 'red' } };
            const chain = mapping.getHandler(route);
            expect(chain).not.toBeNull();
        });

        test('handler rejected when matrixParams condition does not match', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/*', matrixParams: 'color=red' })
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
            route[0] = { data: { color: 'blue' } };
            const chain = mapping.getHandler(route);
            expect(chain).toBeNull();
        });

        test('Radix: more-specific handler (matrixParams) wins when condition matches', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color' })
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
            route[0] = { data: { color: 'red' } };
            const chain = mapping.getHandler(route);
            expect(chain).not.toBeNull();
            expect(chain.handler.method).toBe('getProductColored');
        });

        test('Radix: fallback handler wins when specific condition does not match', () => {
            @routeMapping('/products')
            class ProductsController {
                @routeMapping({ value: '/:id', matrixParams: 'color' })
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
            const chain = mapping.getHandler(route);
            expect(chain).not.toBeNull();
            expect(chain.handler.method).toBe('getProduct');
        });
    });
});
