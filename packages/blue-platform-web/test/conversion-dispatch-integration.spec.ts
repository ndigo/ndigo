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
    routeParams,
    stateValue,
    sessionValue,
} from '@blue/dispatcher';
import { BrowserDispatcher } from '../../blue-dispatcher/src/dispatcher';
import { RouteErrorResolver } from '../../blue-dispatcher/src/route-error-resolver';
import { BrowserModelValueMethodArgumentResolver } from '../src/model-argument-resolver';
import { BrowserSessionValueMethodArgumentResolver } from '../src/session-argument-resolver';
import { BrowserStateValueMethodArgumentResolver } from '../src/state-argument-resolver';
import { BrowserCookieValueMethodArgumentResolver } from '../src/cookie-argument-resolver';
import Cookies from '../src/cookies';

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
            @routeParams({
                amount: cookieValue('amount', {
                    convert: (value) => {
                        const numberValue = Number(value);
                        if (Number.isNaN(numberValue)) {
                            throw new TypeError('invalid amount');
                        }

                        return numberValue;
                    },
                }),
                profileId: modelValue('profile.id', { convert: (value) => Number(value) }),
                txCount: stateValue('txCount', { convert: (value) => Number(value) }),
                darkMode: sessionValue('darkMode', { convert: (value) => value === 'true' }),
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
            errorResolvers() {
                return [new ConversionCapturingErrorResolver()];
            }

            @entry
            viewResolver() {
                return new TestViewResolver();
            }
        }

        const context = new MetadataConfigApplicationContext('test');
        context.addProcessor(new ApplicationContextAwareProcessor(context));
        context.register(TestConfiguration);

        const dispatcher = new BrowserDispatcher();
        dispatcher.initStrategies(context);

        const originalHistory = globalThis.history;
        const originalSessionStorage = globalThis.sessionStorage;

        Object.defineProperty(globalThis, 'history', {
            configurable: true,
            writable: true,
            value: { state: { txCount: '7' } },
        });

        Object.defineProperty(globalThis, 'sessionStorage', {
            configurable: true,
            writable: true,
            value: {
                getItem: (key: string) => (key === 'darkMode' ? 'true' : null),
            },
        });

        Cookies.set('amount', '42');

        const successRoute = {
            id: 1,
            length: 2,
            path: '/checkout/pay',
            params: {},
            raw: '/checkout/pay',
            data: {
                profile: {
                    id: '1001',
                },
            },
            0: { name: 'checkout', raw: 'checkout', data: null },
            1: { name: 'pay', raw: 'pay', data: null },
        };

        try {
            await dispatcher.dispatch(successRoute as any);
        } finally {
            Cookies.remove('amount', {});
        }

        expect(successCapture).toEqual({
            amount: 42,
            profileId: 1001,
            txCount: 7,
            darkMode: true,
        });

        Cookies.set('amount', 'not-a-number');

        const errorRoute = {
            ...successRoute,
            id: 2,
            data: {
                profile: {
                    id: '1001',
                },
            },
        };

        try {
            await dispatcher.dispatch(errorRoute as any);
        } finally {
            Cookies.remove('amount', {});
            Object.defineProperty(globalThis, 'history', {
                configurable: true,
                writable: true,
                value: originalHistory,
            });
            Object.defineProperty(globalThis, 'sessionStorage', {
                configurable: true,
                writable: true,
                value: originalSessionStorage,
            });
        }

        expect(errorCapture).toBeInstanceOf(ParameterConversionError);
        expect((errorCapture as ParameterConversionError).parameterName).toBe('amount');
    });
});
