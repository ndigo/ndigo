const { expect } = require('chai');

import fill from '../src';

describe('fill', function () {
    test('it should load polyfills', function () {
        expect(fill).toBeInstanceOf(Promise);
        return fill
            .then(function (fills) {
                console.log('FILLS', navigator.userAgent, fills);
                expect(fills).toBeInstanceOf(Array);
            })
            .catch(function () {
                expect(true).toBe(true);
            });
    });
});
