import WildcardExp from '../src/wildcard-exp';

describe('WildcardExp', function () {
    test('it should test using wildcards', function () {
        const wce = new WildcardExp('a*b');
        expect(wce.test('abb')).be.true;
    });

    test('it should default to *', function () {
        const wce = new WildcardExp();
        expect(wce.test('abb')).be.true;
    });
});
