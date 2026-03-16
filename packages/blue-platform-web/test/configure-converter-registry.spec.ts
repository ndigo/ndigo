import { describe, expect, test } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { configureArgumentValueConverterRegistry } from '../src/configure-converter-registry';

describe('configureArgumentValueConverterRegistry', () => {
    test('registers converter registry under context key', () => {
        const context = new GenericApplicationContext('test');
        const registry = {
            toInt: (value) => Number(value),
        };

        const result = configureArgumentValueConverterRegistry(context, registry);

        expect(result).toBe(registry);
        expect(context.getValue('argumentValueConverterRegistry')).toBe(registry);
    });
});
