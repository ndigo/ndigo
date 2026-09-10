import { describe, expect, test } from 'vitest';
import { JSONTransformer, TransformContext } from '../../src/transformers';

const context: TransformContext = {
    url: 'http://localhost/test',
    headers: new Headers(),
    direction: 'response',
};

describe('JSONTransformer', () => {
    test('transforms JSON object with pipeline', () => {
        const transformer = new JSONTransformer([
            (value) => ({ ...value, foo: String(value.foo).trim() }),
            (value) => ({ ...value, foo: String(value.foo).toLowerCase() }),
        ]);

        const result = transformer.transform({ foo: '  BAR  ' }, context);
        expect(result).toEqual({ foo: 'bar' });
    });

    test('rejects non-object values in canTransform', () => {
        const transformer = new JSONTransformer([(value) => value]);
        expect(transformer.canTransform(null, context)).toBe(false);
        expect(transformer.canTransform('text', context)).toBe(false);
    });
});
