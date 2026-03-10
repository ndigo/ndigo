import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { BrowserDispatcher } from '../src/dispatcher';
import dispatcherContext from './assets/dispatcher-context';
import { completeHandleSpy, handleRouteSpy, renderSpy, resolveLanguageSpy, testModel } from './test-strategies';
import { MetadataConfigApplicationContext } from '@blue/context';
import { Route } from '@blue/router';

describe('BrowserDispatcher', () => {
    const fooRoute: Route = { path: '/foo' } as any,
        barRoute: Route = { path: '/bar' } as any,
        bazRoute: Route = { path: '/baz' } as any,
        quxRoute: Route = { path: '/qux' } as any,
        helloWorldRoute: Route = { path: '/hello/world' } as any;

    describe('instance', () => {
        let dispatcher: BrowserDispatcher;

        beforeEach(() => {
            dispatcher = new BrowserDispatcher();
            dispatcher.initStrategies(dispatcherContext);
            vi.clearAllMocks();
        });

        afterEach(() => {
            dispatcher = undefined as any;
        });

        test('it should init strategies on contexts', async () => {
            await Promise.all([
                dispatcher.dispatch(fooRoute),
                dispatcher.dispatch(barRoute),
                dispatcher.dispatch(bazRoute),
                dispatcher.dispatch(quxRoute),
                dispatcher.dispatch(helloWorldRoute),
            ]);

            expect(handleRouteSpy).toHaveBeenCalledWith(fooRoute);
            expect(handleRouteSpy).toHaveBeenCalledWith(barRoute);
            expect(handleRouteSpy).toHaveBeenCalledWith(bazRoute);
            expect(handleRouteSpy).toHaveBeenCalledWith(quxRoute);
            expect(renderSpy).toHaveBeenCalledWith(testModel, fooRoute);
            expect(renderSpy).toHaveBeenCalledWith(testModel, barRoute);
            expect(renderSpy).toHaveBeenCalledWith(testModel, bazRoute);
            expect(renderSpy).toHaveBeenCalledWith(testModel, quxRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(fooRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(barRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(bazRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(quxRoute);
        });

        test('it should use context theme when no theme resolver is provided', () => {
            const themeContext = new MetadataConfigApplicationContext('theme-context');
            themeContext.setThemeName('night');

            const themeDispatcher = new BrowserDispatcher();
            themeDispatcher.initStrategies(themeContext);

            expect(themeDispatcher.themeResolver.resolveTheme(fooRoute)).toBe('night');
        });

        test('it should trigger completeHandle after successful render', async () => {
            await dispatcher.dispatch(bazRoute);

            expect(completeHandleSpy).toHaveBeenCalledWith(bazRoute, expect.anything(), null);
        });
    });
});
