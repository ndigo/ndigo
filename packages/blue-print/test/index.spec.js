const { expect, use } = require('chai');
const chai_as_promised = require('chai-as-promised');

import fingerprint from '../src';

use(chai_as_promised);

describe('fingerprint', function () {
    test('it should provide a unique signature', function () {
        expect(fingerprint).to.eventually.be.an('array');
        return fingerprint;
    });
});
