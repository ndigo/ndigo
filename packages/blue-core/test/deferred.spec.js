const { expect, use } = require('chai');
const chai_as_promised = require('chai-as-promised');
import Deferred from '../src/deferred';

use(chai_as_promised);

describe('Deferred', function () {
    let deferred;

    beforeEach(function () {
        deferred = new Deferred();
    });

    afterEach(function () {
        deferred = void 0;
    });

    test('it should resolve', function () {
        deferred.resolve(123);
        expect(deferred.promise).to.eventually.equal(123);
    });

    test('it should reject', function () {
        deferred.reject(123);
        expect(deferred.promise).to.be.rejectedWith(123);
    });
});
