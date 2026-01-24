const { expect, use } = require('chai');
const sinon_chai = require('sinon-chai');
const chai_as_promised = require('chai-as-promised');
import { BrowserDispatcher } from '../src/dispatcher';
import dispatcherContext from './assets/dispatcher-context';
import { handleRouteSpy, renderSpy, resolveLanguageSpy, testModel } from './test-strategies';

use(chai_as_promised);
use(sinon_chai);

describe('BrowserDispatcher', function () {
    const fooRoute = { path: '/foo' },
        barRoute = { path: '/bar' },
        bazRoute = { path: '/baz' },
        quxRoute = { path: '/qux' },
        helloWorldRoute = { path: '/hello/world' };

    describe('instance', function () {
        let dispatcher;

        beforeEach(function () {
            dispatcher = new BrowserDispatcher();
            dispatcher.initStrategies(dispatcherContext);
        });

        afterEach(function () {
            dispatcher = void 0;
        });

        test('it should init strategies on contexts', function () {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            const routes = Promise.all([
                dispatcher.dispatch(fooRoute),
                dispatcher.dispatch(barRoute),
                dispatcher.dispatch(bazRoute),
                dispatcher.dispatch(quxRoute),
                dispatcher.dispatch(helloWorldRoute),
            ]).then(function () {
                expect(handleRouteSpy).to.have.been.calledWith(fooRoute);
                expect(handleRouteSpy).to.have.been.calledWith(barRoute);
                expect(handleRouteSpy).to.have.been.calledWith(bazRoute);
                expect(handleRouteSpy).to.have.been.calledWith(quxRoute);
                expect(renderSpy).to.have.been.calledWith(testModel, fooRoute);
                expect(renderSpy).to.have.been.calledWith(testModel, barRoute);
                expect(renderSpy).to.have.been.calledWith(testModel, bazRoute);
                expect(renderSpy).to.have.been.calledWith(testModel, quxRoute);
                expect(resolveLanguageSpy).to.have.been.calledWith(fooRoute);
                expect(resolveLanguageSpy).to.have.been.calledWith(barRoute);
                expect(resolveLanguageSpy).to.have.been.calledWith(bazRoute);
                expect(resolveLanguageSpy).to.have.been.calledWith(quxRoute);
                console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            });
            expect(routes).to.eventually.be.fulfilled;
            return routes;
        });
    });
});
