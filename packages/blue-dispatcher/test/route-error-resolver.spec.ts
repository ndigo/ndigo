import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import routeErrorResolverContext from './assets/route-error-resolver-context';
import { handleRouteSpy, renderSpy } from './test-strategies';
import { SimpleMappingErrorResolver } from '../src/route-error-resolver';

describe('MetadataErrorResolver', () => {
    const badRoute = { path: '/bad/bad' } as any,
        badRangeRoute = { path: '/bad/range' } as any,
        badReferenceRoute = { path: '/bad/reference' } as any,
        badSyntaxRoute = { path: '/bad/syntax' } as any;

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
            dispatcher.initStrategies(routeErrorResolverContext);
        });

        afterEach(() => {
            dispatcher = undefined as any;
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
            errorResolver = undefined as any;
        });

        test('it should resolve errors', () => {
            let mav;

            expect(errorResolver).toHaveProperty('defaultErrorView');
            expect(errorResolver.defaultErrorView).toBe('defaultError');

            errorResolver.mappedHandlerClasses = [TestHandler as any];
            errorResolver.errorMappings.set('SyntaxError', 'syntaxError');
            errorResolver.errorMappings.set('ReferenceError', 'referenceError');

            mav = errorResolver.resolveError({ path: '/bad/syntax' } as any, new TestHandler(), new SyntaxError());
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('syntaxError');

            mav = errorResolver.resolveError({ path: '/bad/syntax' } as any, new TestHandler(), new ReferenceError());
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('referenceError');

            mav = errorResolver.resolveError({ path: '/foo' } as any, new TestHandler(), new Error());
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('defaultError');
        });
    });
});
