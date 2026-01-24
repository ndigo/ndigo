import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { BrowserDispatcher } from '../src/dispatcher';
import dispatcherContext from './assets/dispatcher-context';
import { handleRouteSpy, renderSpy, resolveLanguageSpy, testModel } from './test-strategies';

describe('BrowserDispatcher', () => {
    const fooRoute = { path: '/foo' },
        barRoute = { path: '/bar' },
        bazRoute = { path: '/baz' },
        quxRoute = { path: '/qux' },
        helloWorldRoute = { path: '/hello/world' };

    describe('instance', () => {
        let dispatcher: BrowserDispatcher;

        beforeEach(() => {
            dispatcher = new BrowserDispatcher();
            dispatcher.initStrategies(dispatcherContext);
        });

        afterEach(() => {
            dispatcher = undefined as any;
        });

        test('it should init strategies on contexts', async () => {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
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
            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        });
    });
});
