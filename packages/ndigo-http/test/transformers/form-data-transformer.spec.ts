/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { FormDataTransformer, TransformContext } from '../../src/transformers';

const context: TransformContext = {
    url: 'http://localhost/test',
    headers: new Headers(),
    mediaType: null,
    direction: 'request',
};

describe('FormDataTransformer', () => {
    test('transforms form data entries', () => {
        const transformer = new FormDataTransformer((key, value) => [key.toLowerCase(), value]);
        const form = new FormData();
        form.append('Name', 'Alice');

        const result = transformer.transform(form, context);
        expect(result.get('name')).toBe('Alice');
    });

    test('filters entries by returning null', () => {
        const transformer = new FormDataTransformer((key, value) => (key === 'drop' ? null : [key, value]));
        const form = new FormData();
        form.append('keep', 'yes');
        form.append('drop', 'no');

        const result = transformer.transform(form, context);
        expect(result.get('keep')).toBe('yes');
        expect(result.get('drop')).toBeNull();
    });
});
