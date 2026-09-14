/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { TransformContext, URLSearchParamsTransformer } from '../../src/transformers';

const context: TransformContext = {
    url: 'http://localhost/test',
    headers: new Headers(),
    direction: 'request',
};

describe('URLSearchParamsTransformer', () => {
    test('transforms search param entries', () => {
        const transformer = new URLSearchParamsTransformer((key, value) => [key.toLowerCase(), value]);
        const params = new URLSearchParams();
        params.append('Name', 'Alice');

        const result = transformer.transform(params, context);
        expect(result.get('name')).toBe('Alice');
    });

    test('supports postProcess hook', () => {
        const transformer = new URLSearchParamsTransformer(
            (key, value) => [key, value],
            (params) => {
                params.set('extra', '1');
                return params;
            }
        );

        const result = transformer.transform(new URLSearchParams('a=1'), context);
        expect(result.get('a')).toBe('1');
        expect(result.get('extra')).toBe('1');
    });
});
