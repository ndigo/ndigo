/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import routeErrorResolverContext from './assets/route-error-resolver-context';
import { handleRouteSpy, renderSpy } from './test-strategies';
import {
    DefaultRouteErrorResolver,
    MetadataErrorResolver,
    SimpleMappingErrorResolver,
} from '../src/route-error-resolver';
import { FrameworkError } from '@blue/core';
import { RouteHandlerMethod } from '../src/route-handler-method';
import { errorMapping } from '../src/error-mapping';
import { ModelAndView } from '../src/model-and-view';
import { Route } from '@blue/router';

describe('MetadataErrorResolver', () => {
    // Tests need only the path; the rest of Route is filled by the router.
    const toRoute = (path: string): Route => ({ path }) as unknown as Route,
        badRoute = toRoute('/bad/bad'),
        badRangeRoute = toRoute('/bad/range'),
        badReferenceRoute = toRoute('/bad/reference'),
        badSyntaxRoute = toRoute('/bad/syntax');

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
            dispatcher.initStrategies(routeErrorResolverContext);
        });

        afterEach(() => {
            dispatcher = undefined as unknown as AbstractDispatcher;
        });

        test('it should resolve errors', async () => {
            await Promise.all([
                dispatcher.dispatch(badRoute),
                dispatcher.dispatch(badRangeRoute),
                dispatcher.dispatch(badReferenceRoute),
                dispatcher.dispatch(badSyntaxRoute),
            ]);

            expect(renderSpy).toHaveBeenCalledWith(undefined, badRoute, undefined);
            expect(renderSpy).toHaveBeenCalledWith(undefined, badRangeRoute, undefined);
            expect(renderSpy).toHaveBeenCalledWith(undefined, badReferenceRoute, undefined);
            expect(renderSpy).toHaveBeenCalledWith(undefined, badSyntaxRoute, undefined);
        });
    });

    describe('inherited mappings', () => {
        class CustomError extends Error {}

        class BaseErrorHandler {
            @errorMapping(CustomError)
            handleCustomError() {
                return new ModelAndView('error');
            }
        }

        class SubErrorHandler extends BaseErrorHandler {}

        test('it should resolve a base-declared error mapping on a bare subclass handler', () => {
            const errorResolver = new MetadataErrorResolver();

            const mav = errorResolver.resolveError(
                { path: '/bad/custom' } as unknown as Route,
                new RouteHandlerMethod(new SubErrorHandler(), 'handleRequest'),
                new CustomError('custom')
            );

            expect(mav).not.toBeNull();
            expect(mav?.viewName).toBe('error');
        });
    });
});

describe('SimpleMappingErrorResolver', () => {
    class TestHandler {
        handleRoute = handleRouteSpy;
    }

    describe('instance', () => {
        let errorResolver: SimpleMappingErrorResolver;

        beforeEach(() => {
            errorResolver = new SimpleMappingErrorResolver('defaultError');
        });

        afterEach(() => {
            errorResolver = undefined as unknown as SimpleMappingErrorResolver;
        });

        test('it should resolve errors', () => {
            let mav: ModelAndView | null;

            expect(errorResolver).toHaveProperty('defaultErrorView');
            expect(errorResolver.defaultErrorView).toBe('defaultError');

            errorResolver.mappedHandlerClasses = [TestHandler];
            const { errorMappings } = errorResolver;
            // The constructor always installs the map; guard for the null-typed field contract.
            if (errorMappings) {
                errorMappings.set('SyntaxError', 'syntaxError');
                errorMappings.set('ReferenceError', 'referenceError');
            }

            mav = errorResolver.resolveError(
                { path: '/bad/syntax' } as unknown as Route,
                new TestHandler(),
                new SyntaxError()
            );
            expect(mav).toHaveProperty('viewName');
            expect(mav?.viewName).toBe('syntaxError');

            mav = errorResolver.resolveError(
                { path: '/bad/syntax' } as unknown as Route,
                new TestHandler(),
                new ReferenceError()
            );
            expect(mav).toHaveProperty('viewName');
            expect(mav?.viewName).toBe('referenceError');

            mav = errorResolver.resolveError({ path: '/foo' } as unknown as Route, new TestHandler(), new Error());
            expect(mav).toHaveProperty('viewName');
            expect(mav?.viewName).toBe('defaultError');
        });
    });
});

describe('DefaultRouteErrorResolver (DSV-DISP-4)', () => {
    class WidgetNotFoundError extends FrameworkError {}

    test('maps a subclass through its preconfigured base-class mapping', () => {
        const resolver = new DefaultRouteErrorResolver();

        // Pre-fix only the exact constructor name was looked up, so the
        // preconfigured `FrameworkError` mapping was dead for every subclass.
        const mav = resolver.resolveError({} as Route, null, new WidgetNotFoundError('gone'));

        expect(mav?.viewName).toBe('error/framework');
    });

    test('a subclass-specific mapping wins over the base mapping', () => {
        const resolver = new DefaultRouteErrorResolver();
        resolver.setErrorMapping('WidgetNotFoundError', 'widget/not-found');

        const mav = resolver.resolveError({} as Route, null, new WidgetNotFoundError('gone'));

        expect(mav?.viewName).toBe('widget/not-found');
    });

    test('an unmapped error falls back to the default view', () => {
        const resolver = new DefaultRouteErrorResolver();

        const mav = resolver.resolveError({} as Route, null, new TypeError('boom'));

        expect(mav?.viewName).toBe('error/default');
    });
});

describe('SimpleMappingErrorResolver substring hierarchy (DSV-DISP-4)', () => {
    class TestHandler {
        handleRoute = handleRouteSpy;
    }

    test('matches a base-class substring, preferring the deepest match', () => {
        const resolver = new SimpleMappingErrorResolver();
        resolver.mappedHandlerClasses = [TestHandler];
        resolver.errorMappings?.set('SyntaxError', 'syntax');
        resolver.errorMappings?.set('Error', 'any-error');

        // Deepest match (the error's own class) beats the broad `Error` key.
        expect(resolver.resolveError({} as Route, new TestHandler(), new SyntaxError())?.viewName).toBe('syntax');
        // Pre-fix exact-name lookup ignored the `Error` substring entirely and
        // fell through to the default (null here, as no default was set).
        expect(resolver.resolveError({} as Route, new TestHandler(), new TypeError())?.viewName).toBe('any-error');
    });
});
