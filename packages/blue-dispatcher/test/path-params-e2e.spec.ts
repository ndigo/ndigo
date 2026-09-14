/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    ApplicationContextAwareProcessor,
    configuration,
    entry,
    MetadataConfigApplicationContext,
} from '@blue/context';
import { PathRoute, type Route } from '@blue/router';
import { AbstractDispatcher } from '../src/dispatcher';
import { ModelAndView } from '../src/model-and-view';
import { routeMapping } from '../src/route-mapping';
import { pathVariable, parameters } from '../src/parameters';
import { TestErrorResolver, TestViewResolver } from './test-strategies';

describe('path params e2e', () => {
    test('should resolve route params from router and inject into dispatcher handler', async () => {
        let capturedUserId: string | undefined;

        @routeMapping('/users')
        class UsersController {
            @routeMapping('/42')
            @parameters({
                userId: pathVariable('userId'),
            })
            handleUser(userId: string): ModelAndView {
                capturedUserId = userId;
                return new ModelAndView('test');
            }
        }

        @configuration
        class TestConfiguration {
            @entry
            errorResolvers() {
                return [new TestErrorResolver()];
            }

            @entry
            usersController() {
                return new UsersController();
            }

            @entry
            viewResolver() {
                return new TestViewResolver();
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfiguration);

        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(context);

        const route = new PathRoute('/users/42');
        route.resolveParams('/users/:userId');

        const request = {
            0: route[0],
            1: route[1],
            id: route.id,
            length: route.length,
            path: `/${route.path}`,
            params: route.params,
            raw: route.raw,
            data: route.data,
        };

        await dispatcher.dispatch(request as unknown as Route);

        expect(capturedUserId).toBe('42');
    });
});
