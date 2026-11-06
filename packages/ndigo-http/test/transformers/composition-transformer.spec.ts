/**
 */
import { describe, expect, test } from 'vitest';
import { CompositionTransformer, TransformContext } from '../../src/transformers';

const context: TransformContext = {
    url: 'http://localhost/test',
    headers: new Headers(),
    mediaType: null,
    direction: 'request',
};

describe('CompositionTransformer', () => {
    test('applies transforms left-to-right', () => {
        const transformer = new CompositionTransformer<string, string>([
            (value) => String(value).trim(),
            (value) => String(value).toLowerCase(),
        ]);

        expect(transformer.canTransform('  HELLO  ', context)).toBe(true);
        expect(transformer.transform('  HELLO  ', context)).toBe('hello');
    });

    test('respects condition predicate', () => {
        const transformer = new CompositionTransformer<string, string>(
            [(value) => `${String(value)}!`],
            (body, ctx) => ctx.direction === 'response'
        );

        expect(transformer.canTransform('a', context)).toBe(false);
    });
});
