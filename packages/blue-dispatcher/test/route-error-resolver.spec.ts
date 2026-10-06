/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import routeErrorResolverContext from './assets/route-error-resolver-context';
import { handleRouteSpy, renderSpy } from './test-strategies';
import { MetadataErrorResolver, SimpleMappingErrorResolver } from '../src/route-error-resolver';
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
            expect(mav.viewName).toBe('syntaxError');

            mav = errorResolver.resolveError(
                { path: '/bad/syntax' } as unknown as Route,
                new TestHandler(),
                new ReferenceError()
            );
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('referenceError');

            mav = errorResolver.resolveError({ path: '/foo' } as unknown as Route, new TestHandler(), new Error());
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('defaultError');
        });
    });
});
