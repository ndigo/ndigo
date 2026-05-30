/**
 * @author Jeff Rose
 */

import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { routeMapping } from '../src/route-mapping';
import { RadixMetadataHandlerMapping } from '../src/radix-route-handler-mapping';

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

        const chain = mapping.getHandler({ path: '/hello/world' } as any);
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

        const chain = mapping.getHandler({ path: '/users/42' } as any);
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

        const chain = mapping.getHandler({ path: '/users/42' } as any);
        expect(chain).not.toBeNull();
    });

    test('route params set on route object', () => {
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
        mapping.getHandler(route as any);

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
        mapping.getHandler(route as any);

        expect((route as any).pattern).toBe('/users/:id');
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

        const chain = mapping.getHandler({ path: '/nonexistent' } as any);
        expect(chain).toBeNull();
    });

    test('wildcard route * resolves handler', () => {
        @routeMapping('/api')
        class ApiController {
            @routeMapping('/*')
            handle() {
                return 'ok';
            }
        }

        ctx.setValue('apiController', new ApiController());

        const mapping = new RadixMetadataHandlerMapping();
        mapping.setApplicationContext(ctx);
        mapping.init();

        const chain = mapping.getHandler({ path: '/api/anything' } as any);
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
        let chain = mapping.getHandler({ path: '/users/1' } as any);
        expect(chain).not.toBeNull();
        expect(chain.handler.method).toBe('getUser');

        // Test posts controller
        chain = mapping.getHandler({ path: '/posts/2' } as any);
        expect(chain).not.toBeNull();
        expect(chain.handler.method).toBe('getPost');
    });
});