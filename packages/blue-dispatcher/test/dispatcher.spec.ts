/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';
import { DISPATCHER } from '../src/context-tokens';
import { AbstractDispatcher, DISPATCH_ERROR_ATTRIBUTE, getDispatchError } from '../src/dispatcher';
import { ModelAndView } from '../src/model-and-view';
import dispatcherContext from './assets/dispatcher-context';
import errorContext from './assets/route-error-resolver-context';
import {
    completeHandleSpy,
    destroyViewSpy,
    handleRouteSpy,
    renderSpy,
    resolveLanguageSpy,
    testModel,
    TestView,
} from './test-strategies';
import { MetadataConfigApplicationContext } from '@blue/context';
import { Route } from '@blue/router';

describe('AbstractDispatcher', () => {
    // Tests need only the path; the rest of Route is filled by the router.
    const toRoute = (path: string): Route => ({ path }) as unknown as Route,
        fooRoute = toRoute('/foo'),
        barRoute = toRoute('/bar'),
        bazRoute = toRoute('/baz'),
        quxRoute = toRoute('/qux'),
        helloWorldRoute = toRoute('/hello/world');

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
            dispatcher.initStrategies(dispatcherContext);
            vi.clearAllMocks();
        });

        afterEach(() => {
            dispatcher = undefined as unknown as AbstractDispatcher;
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

        test('it should reuse resolver-cached views without destroying them', async () => {
            // Views obtained through the resolver chain are cache-owned
            // singletons — replacing them must not destroy the cached
            // instances (destroying would poison the resolver cache).
            await dispatcher.dispatch(fooRoute);
            await dispatcher.dispatch(barRoute);

            expect(destroyViewSpy).not.toHaveBeenCalled();
        });

        test('it should destroy handler-created views when replaced', async () => {
            const one = new TestView('one'),
                two = new TestView('two');
            handleRouteSpy.mockReturnValue(new ModelAndView(one));
            await dispatcher.dispatch(fooRoute);
            handleRouteSpy.mockReturnValue(new ModelAndView(two));
            await dispatcher.dispatch(barRoute);

            expect(destroyViewSpy).toHaveBeenCalledTimes(1);
            expect(destroyViewSpy).toHaveBeenCalledWith('one');
            // Restore the shared spy's default for other tests.
            handleRouteSpy.mockReturnValue(testModel);
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

        await dispatcher.dispatch({ path: '/bad/bad' } as unknown as Route);

        expect(renderSpy).toHaveBeenCalled();
    });

    it('returns error ModelAndView with viewName from error handler', async () => {
        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(errorContext);

        await dispatcher.dispatch({ path: '/bad/bad' } as unknown as Route);

        expect(renderSpy).toHaveBeenCalledWith(undefined, expect.objectContaining({ path: '/bad/bad' }), undefined);
    });
});

describe('Dispatch error attribute (DSV-B1)', () => {
    const routeWithAttributes = (path: string): Route => ({ path, attributes: {} }) as unknown as Route;

    afterEach(() => {
        // `renderSpy` carries a one-shot rejection between tests; reset it so
        // later renders resolve again (the shared handler spy keeps its default).
        renderSpy.mockReset();
    });

    test('records a swallowed render failure on the route and still resolves', async () => {
        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(dispatcherContext);
        const failure = new Error('view render blew up');
        renderSpy.mockRejectedValueOnce(failure);

        const route = routeWithAttributes('/foo');
        // The dispatcher must not reject — browser callers fire and forget.
        await expect(dispatcher.dispatch(route)).resolves.toBeUndefined();

        expect(route.attributes[DISPATCH_ERROR_ATTRIBUTE]).toBe(failure);
        expect(getDispatchError(route)).toBe(failure);
    });

    test('leaves the attribute absent after a clean render', async () => {
        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(dispatcherContext);

        const route = routeWithAttributes('/foo');
        await dispatcher.dispatch(route);

        expect(route.attributes).not.toHaveProperty(DISPATCH_ERROR_ATTRIBUTE);
        expect(getDispatchError(route)).toBeNull();
    });

    test('does not record an error that an error resolver already rendered', async () => {
        const dispatcher = new AbstractDispatcher();
        dispatcher.initStrategies(errorContext);

        const route = routeWithAttributes('/bad/bad');
        await dispatcher.dispatch(route);

        // The global error handler produced an error view that rendered — the
        // original failure is not an unhandled dispatch error.
        expect(route.attributes).not.toHaveProperty(DISPATCH_ERROR_ATTRIBUTE);
        expect(getDispatchError(route)).toBeNull();
    });
});
