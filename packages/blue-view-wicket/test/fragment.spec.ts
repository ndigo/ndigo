import { describe, expect, it } from 'vitest';
import { Fragment } from '../src/fragment';

describe('Fragment', () => {
    it('sets id and fragment id in constructor', () => {
        const fragment = new Fragment('fragment', 'slot');

        expect(fragment.id).toBe('fragment');
        expect(fragment.fragmentId).toBe('slot');
    });

    it('exposes fragmentId getter', () => {
        const fragment = new Fragment('fragment', 'region');

        expect(fragment.fragmentId).toBe('region');
    });

    it('exposes Symbol.toStringTag', () => {
        const fragment = new Fragment('fragment', 'slot');

        expect(Object.prototype.toString.call(fragment)).toBe('[object Fragment]');
    });
});
