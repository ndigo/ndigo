import { describe, expect, it } from 'vitest';
import { likeProducerView } from '../src/producer-view';

describe('likeProducerView', () => {
    it('detects objects with renderTo', () => {
        expect(likeProducerView({ renderTo: async () => ({ body: '' }) })).toBe(true);
    });

    it('rejects null and non-objects', () => {
        expect(likeProducerView(null)).toBe(false);
        expect(likeProducerView(undefined)).toBe(false);
        expect(likeProducerView('renderTo')).toBe(false);
    });

    it('rejects objects without renderTo', () => {
        expect(likeProducerView({ render() {} })).toBe(false);
    });
});
