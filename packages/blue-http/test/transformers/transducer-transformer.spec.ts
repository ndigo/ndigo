import { compose } from '@blue/util/function';
import { filter, map, take } from '@blue/util/list';
import { describe, expect, test } from 'vitest';
import { TransformContext, TransducerTransformer } from '../../src/transformers';

const context: TransformContext = {
    url: 'http://localhost/test',
    headers: new Headers(),
    direction: 'response',
};

describe('TransducerTransformer', () => {
    test('transforms iterable values using transduce', () => {
        const xform = compose(
            map((value: number) => value * 2),
            filter((value: number) => value > 2),
            take(2)
        );

        const transformer = new TransducerTransformer<number[], number[]>(xform);
        const result = transformer.transform([1, 2, 3, 4], context);

        expect(result).toEqual([4, 6]);
    });

    test('returns false for non-iterable values', () => {
        const transformer = new TransducerTransformer<any, any>(compose(map((v: number) => v)));
        expect(transformer.canTransform(123 as any, context)).toBe(false);
    });
});
