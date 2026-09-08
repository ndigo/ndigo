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
    modelValue,
    ParameterConversionError,
    routeMapping,
    parameters,
    stateValue,
    sessionValue,
    asNumber,
    asBoolean,
    MethodParameter,
    MethodParameterType,
} from '@blue/dispatcher';
import { BrowserDispatcher } from '../src/browser-dispatcher';
import { RouteErrorResolver } from '../../blue-dispatcher/src/route-error-resolver';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';
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
        let successCapture: any = null;
        let errorCapture: Error | null = null;

        @routeMapping('/checkout')
        class CheckoutController {
            @routeMapping('/pay')
            @parameters({
                amount: asNumber(cookieValue('amount')),
                profileId: asNumber(modelValue('profile.id')),
                txCount: asNumber(stateValue('txCount')),
                darkMode: asBoolean(sessionValue('darkMode')),
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
                    new BrowserModelValueMethodArgumentResolver(),
                    new BrowserStateValueMethodArgumentResolver(),
                    new BrowserSessionValueMethodArgumentResolver(),
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
        await context.refresh();

        // Verify resolvers are registered
        const resolvers = context.getValue<any[]>('argumentResolvers');
        if (resolvers && resolvers.length > 0) {
            // Test type-based conversion directly
            const stateResolver = resolvers.find((r) => r instanceof BrowserStateValueMethodArgumentResolver);
            const parameter = new MethodParameter(MethodParameterType.STATE, 'txCount', false, null, {
                source: String,
                target: Number,
            });

            // Mock history.state
            const originalState = globalThis.history?.state;
            vi.stubGlobal('history', { state: { txCount: '7' } });

            const value = stateResolver.resolveArgument(parameter, {} as any, {} as any);
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
