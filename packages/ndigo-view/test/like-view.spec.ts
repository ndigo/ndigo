/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { AbstractView, likeView } from '../src/index';

class TestView extends AbstractView {
    async _renderView(): Promise<void> {
        // Not exercised — shape only.
    }
}

describe('likeView', () => {
    it('accepts a real View instance', () => {
        expect(likeView(new TestView())).toBe(true);
    });

    it('accepts any render-function object with a mediaType', () => {
        const shaped = { mediaType: null, render: () => undefined };
        expect(likeView(shaped)).toBe(true);
    });

    it('rejects objects without a render function', () => {
        expect(likeView({ mediaType: null })).toBe(false);
    });

    it('rejects objects without a mediaType', () => {
        expect(likeView({ render: () => undefined })).toBe(false);
    });

    it('rejects primitives, arrays, and null', () => {
        expect(likeView('view')).toBe(false);
        expect(likeView(42)).toBe(false);
        expect(likeView(null)).toBe(false);
        expect(likeView(undefined)).toBe(false);
        expect(likeView([{ render: () => undefined, mediaType: null }])).toBe(false);
    });
});
