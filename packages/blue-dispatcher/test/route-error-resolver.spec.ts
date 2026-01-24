import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { BrowserDispatcher } from '../src/dispatcher';
import routeErrorResolverContext from './assets/route-error-resolver-context';
import { handleRouteSpy, renderSpy, errorModel } from './test-strategies';
import { SimpleMappingErrorResolver } from '../src/route-error-resolver';

describe('MetadataErrorResolver', () => {
    const badRoute = { path: '/bad/bad' },
        badRangeRoute = { path: '/bad/range' },
        badReferenceRoute = { path: '/bad/reference' },
        badSyntaxRoute = { path: '/bad/syntax' };

    describe('instance', () => {
        let dispatcher: BrowserDispatcher;

        beforeEach(() => {
            dispatcher = new BrowserDispatcher();
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

            expect(renderSpy).toHaveBeenCalledWith(errorModel, badRoute);
            expect(renderSpy).toHaveBeenCalledWith(errorModel, badRangeRoute);
            expect(renderSpy).toHaveBeenCalledWith(errorModel, badReferenceRoute);
            expect(renderSpy).toHaveBeenCalledWith(errorModel, badSyntaxRoute);
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

            mav = errorResolver.resolveError({ path: '/bad/syntax' }, new TestHandler(), SyntaxError);
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('syntaxError');

            mav = errorResolver.resolveError({ path: '/bad/syntax' }, new TestHandler(), ReferenceError);
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('referenceError');

            mav = errorResolver.resolveError({ path: '/foo' }, new TestHandler(), Error);
            expect(mav).toHaveProperty('viewName');
            expect(mav.viewName).toBe('defaultError');
        });
    });
});
