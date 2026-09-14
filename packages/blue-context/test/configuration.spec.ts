/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { MetadataConfigApplicationContext } from '../src/configuration';
import testContext from './testContext';

describe('Configuration', () => {
    test('it should register values', () => {
        const bar = testContext.getValue('bar'),
            foo = testContext.getValue('foo'),
            qux = testContext.getValue('qux'),
            baz = testContext.getValue('baz'),
            fuu = testContext.getValue('fuu');

        expect(foo).toBe(12);
        expect(bar).not.toBeUndefined();
        expect(baz).toBe(12);
        expect(qux).toBeUndefined();
        expect(fuu).toBe(78);
    });
});

describe('MetadataConfigApplicationContext', () => {
    test('it should ignore non-configurations', () => {
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
