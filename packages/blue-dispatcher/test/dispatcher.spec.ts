import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { DISPATCHER } from '../src/context-tokens';
import { AbstractDispatcher } from '../src/dispatcher';
import dispatcherContext from './assets/dispatcher-context';
import errorContext from './assets/route-error-resolver-context';
import { completeHandleSpy, destroyViewSpy, handleRouteSpy, renderSpy, resolveLanguageSpy } from './test-strategies';
import { MetadataConfigApplicationContext } from '@blue/context';
import { Route } from '@blue/router';

describe('AbstractDispatcher', () => {
    const fooRoute: Route = { path: '/foo' } as any,
        barRoute: Route = { path: '/bar' } as any,
        bazRoute: Route = { path: '/baz' } as any,
        quxRoute: Route = { path: '/qux' } as any,
        helloWorldRoute: Route = { path: '/hello/world' } as any;

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
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
            expect(renderSpy).toHaveBeenCalledWith(undefined, fooRoute, undefined);
            expect(renderSpy).toHaveBeenCalledWith(undefined, barRoute, undefined);
            expect(renderSpy).toHaveBeenCalledWith(undefined, bazRoute, undefined);
            expect(renderSpy).toHaveBeenCalledWith(undefined, quxRoute, undefined);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(fooRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(barRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(bazRoute);
            expect(resolveLanguageSpy).toHaveBeenCalledWith(quxRoute);
        });

        test('it should provide DISPATCHER context token', () => {
            expect(DISPATCHER.description).toBe('dispatcher');
        });

        test('it should use context theme when no theme resolver is provided', () => {
            const themeContext = new MetadataConfigApplicationContext('theme-context');
            themeContext.setThemeName('night');

            const themeDispatcher = new AbstractDispatcher();
            themeDispatcher.initStrategies(themeContext);

            expect(themeDispatcher.themeResolver.resolveTheme(fooRoute)).toBe('night');
        });

        test('it should trigger completeHandle after successful render', async () => {
            await dispatcher.dispatch(bazRoute);

            expect(completeHandleSpy).toHaveBeenCalledWith(bazRoute, expect.anything(), null);
        });

        test('it should destroy previous view instance after route navigation', async () => {
            await dispatcher.dispatch(fooRoute);
            await dispatcher.dispatch(barRoute);

            expect(destroyViewSpy).toHaveBeenCalledTimes(1);
            expect(destroyViewSpy).toHaveBeenCalledWith('test');
        });
    });
});

describe('Error View Dispatch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('resolves errors through metadata error resolvers', async () => {
        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(errorContext);

        await dispatcher.dispatch({ path: '/bad/bad' } as any);

        expect(renderSpy).toHaveBeenCalled();
    });

    it('returns error ModelAndView with viewName from error handler', async () => {
        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(errorContext);

        await dispatcher.dispatch({ path: '/bad/bad' } as any);

        expect(renderSpy).toHaveBeenCalledWith(undefined, expect.objectContaining({ path: '/bad/bad' }), undefined);
    });
});
