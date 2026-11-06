/**
 */
import { describe, expect, test } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { configureArgumentValueConverterRegistry } from '../src/configure-converter-registry';
import { argumentValueConverters } from '@ndigo/dispatcher';

describe('configureArgumentValueConverterRegistry', () => {
    test('registers converter registry under context key', () => {
        const context = new GenericApplicationContext('test');
        const registry = {
            toInt: argumentValueConverters.number,
        };

        const result = configureArgumentValueConverterRegistry(context, registry);

        expect(result).toBe(registry);
        expect(context.getValue('argumentValueConverterRegistry')).toBe(registry);
    });
});
