import { MetadataConfigApplicationContext } from '../src/configuration';
import testContext from './testContext';

describe('Configuration', function () {
    test('it should register values', function () {
        const bar = testContext.getValue('bar'),
            foo = testContext.getValue('foo'),
            qux = testContext.getValue('qux'),
            baz = testContext.getValue('baz'),
            fuu = testContext.getValue('fuu');

        expect(foo).toBe(12);
        expect(bar).to.not.be.undefined;
        expect(baz).toBe(12);
        expect(qux).toBeUndefined();
        expect(fuu).toBe(78);
    });
});

describe('MetadataConfigApplicationContext', function () {
    test('it should ignore non-configurations', function () {
        class FakeConfig {
            foo() {
                return 'foo';
            }
        }

        const context = new MetadataConfigApplicationContext();
        context.register(FakeConfig);

        expect(context.getValue('foo')).toBeUndefined();
    });
});
