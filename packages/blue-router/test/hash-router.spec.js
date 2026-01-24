const { expect } = require('chai');

import HashRouter from '../src/hash-router';

describe('HashRouter', function () {
    let router;

    beforeEach(function () {
        location.hash = '';
    });

    afterEach(function () {
        router && router.destroy();
    });

    test('it should listen for hash changes', function (done) {
        const route = '/foo;a=1;b=2/bar;c=3;d=4/baz?e=5&f=6',
            onComplete = function (newRoute) {
                expect(newRoute).toBe(route);
                done();
            },
            router = new HashRouter(onComplete);

        location.hash = route;
    });
});
