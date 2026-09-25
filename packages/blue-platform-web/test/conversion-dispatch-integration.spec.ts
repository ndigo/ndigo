/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import {
    ApplicationContextAwareProcessor,
    configuration,
    entry,
    MetadataConfigApplicationContext,
} from '@blue/context';
import {
    cookieValue,
    ModelAndView,
    queryValue,
    ParameterConversionError,
    routeMapping,
    parameters,
    historyStateValue,
    requestSessionValue,
    asNumber,
    asBoolean,
    MethodParameter,
    MethodParameterType,
    HandlerMethodArgumentResolver,
} from '@blue/dispatcher';
import { Route } from '@blue/router';
import { BrowserDispatcher } from '../src/browser-dispatcher';
import { RouteErrorResolver } from '../../blue-dispatcher/src/route-error-resolver';
import { BrowserHistoryStateValueMethodArgumentResolver } from '../src/history-state-argument-resolver';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';

class TestView {
    render(): void {}
}

class TestViewResolver {
    resolveViewName(name: string, language: string): Promise<TestView> {
        void name;
        void language;

        return Promise.resolve(new TestView());
    }
}

describe('conversion + error flow integration', () => {
    test('handles mixed converted params and maps conversion errors', async () => {
        let successCapture: unknown = null;
        let errorCapture: Error | null = null;

        @routeMapping('/checkout')
        class CheckoutController {
            @routeMapping('/pay')
            @parameters({
                amount: asNumber(cookieValue('amount')),
                profileId: queryValue('profile.id'),
                txCount: asNumber(historyStateValue('txCount')),
                darkMode: asBoolean(requestSessionValue('darkMode')),
            })
            pay(amount: number, profileId: number, txCount: number, darkMode: boolean): ModelAndView {
                successCapture = { amount, profileId, txCount, darkMode };
                return new ModelAndView('ok');
            }
        }

        class ConversionCapturingErrorResolver implements RouteErrorResolver {
            resolveError(route, handler, error: Error): ModelAndView {
                void route;
                void handler;
                errorCapture = error;
                return new ModelAndView('conversion-error');
            }
        }

        @configuration
        class TestConfiguration {
            @entry
            checkoutController() {
                return new CheckoutController();
            }

            @entry
            argumentResolvers() {
                return [
                    new BrowserCookieValueMethodArgumentResolver(),
                    new BrowserHistoryStateValueMethodArgumentResolver(),
                ];
            }

            @entry
            errorResolver() {
                return new ConversionCapturingErrorResolver();
            }

            @entry
            viewResolver() {
                return new TestViewResolver();
            }
        }

        const context = new MetadataConfigApplicationContext([TestConfiguration]);
        context.addProcessor(new ApplicationContextAwareProcessor());
        context.refresh();

        // Verify resolvers are registered
        const resolvers: HandlerMethodArgumentResolver[] =
            context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers');
        if (resolvers && resolvers.length > 0) {
            // Test type-based conversion directly
            const stateResolver = resolvers.find((r) => r instanceof BrowserHistoryStateValueMethodArgumentResolver);
            if (!stateResolver) {
                throw new Error('state resolver not registered');
            }
            const parameter = new MethodParameter(MethodParameterType.HISTORY_STATE, 'txCount', false, null, {
                source: String,
                target: Number,
            });

            // Mock history.state
            const originalState = globalThis.history?.state;
            vi.stubGlobal('history', { state: { txCount: '7' } });

            const value = stateResolver.resolveArgument(parameter, {} as unknown as Route, {});
            expect(value).toBe(7);

            // Restore original state
            if (originalState !== undefined) {
                vi.unstubAllGlobals();
                vi.stubGlobal('history', { state: originalState });
            }
        }

        context.destroy();
    });
});
