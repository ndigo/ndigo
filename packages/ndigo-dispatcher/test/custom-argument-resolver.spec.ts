/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import {
    ApplicationContextAwareProcessor,
    configuration,
    entry,
    MetadataConfigApplicationContext,
} from '@ndigo/context';
import { ApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import { AbstractDispatcher } from '../src/dispatcher';
import { HandlerMethodArgumentResolver } from '../src/argument-resolver';
import { ModelAndView } from '../src/model-and-view';
import { MetadataHandlerAdapter } from '../src/route-handler-adapter';
import { routeMapping } from '../src/route-mapping';
import { MethodParameter, MethodParameterType, queryValue, parameters } from '../src/parameters';
import { TestErrorResolver, TestViewResolver } from './test-strategies';

class CustomQueryArgumentResolver implements HandlerMethodArgumentResolver {
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.QUERY.equals(parameter.type);
    }

    resolveArgument(parameter: MethodParameter, route: Route): string {
        return `custom:${route.data[parameter.name]}`;
    }
}

describe('custom argument resolvers', () => {
    test('prefers context argumentResolvers over defaults', async () => {
        let capturedName: string | undefined;

        @routeMapping('/hello')
        class HelloController {
            @routeMapping('/there')
            @parameters({
                name: queryValue('name'),
            })
            handleThere(name: string): ModelAndView {
                capturedName = name;
                return new ModelAndView('test');
            }
        }

        @configuration
        class TestConfiguration {
            @entry()
            argumentResolvers() {
                return [new CustomQueryArgumentResolver()];
            }

            @entry()
            errorResolvers() {
                return [new TestErrorResolver()];
            }

            @entry()
            helloController() {
                return new HelloController();
            }

            @entry()
            viewResolver() {
                return new TestViewResolver();
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfiguration);

        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(context);

        const request: Route = {
            id: 1,
            length: 2,
            path: '/hello/there',
            params: {},
            raw: '/hello/there',
            data: { name: 'John' },
            attributes: {},
            0: { name: 'hello', raw: 'hello', data: null },
            1: { name: 'there', raw: 'there', data: null },
        } as unknown as Route;

        await dispatcher.dispatch(request);

        expect(capturedName).toBe('custom:John');
    });

    test('discovers singular argumentResolver from context', () => {
        const context = new MetadataConfigApplicationContext('test');
        const customResolver = new CustomQueryArgumentResolver();
        context.setValue('argumentResolver', customResolver);

        const adapter = new MetadataHandlerAdapter();
        adapter.setApplicationContext(context as unknown as ApplicationContext);

        // _discoverArgumentResolvers is private; exercise it through the
        // public interface contract via the context-registered resolver.
        const resolvers = (
            adapter as unknown as { _discoverArgumentResolvers(): HandlerMethodArgumentResolver[] }
        )._discoverArgumentResolvers();

        expect(resolvers).toContain(customResolver);
    });
});
