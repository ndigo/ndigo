/**
 * Slider: parts, value, keyboard, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdSlider } from '../registry/ui/slider/nd-slider';

const MARKUP = `
    <label data-part="label">Volume</label>
    <div data-part="control">
        <div data-part="track"><div data-part="range"></div></div>
        <div data-part="thumb"></div>
    </div>
`;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

function press(target: EventTarget, key: string): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-slider>', () => {
    it('exposes the thumb role and initial value', async () => {
        const slider = mountElement<NdSlider>('nd-slider', MARKUP, { value: '40' });
        await flush();
        const thumb = getPart<HTMLElement>(slider, '[data-part="thumb"]');

        expect(slider).toBeInstanceOf(NdSlider);
        expect(thumb.getAttribute('role')).toBe('slider');
        expect(thumb.getAttribute('aria-valuemin')).toBe('0');
        expect(thumb.getAttribute('aria-valuemax')).toBe('100');
        expect(thumb.getAttribute('aria-valuenow')).toBe('40');
        expect(thumb.getAttribute('tabindex')).toBe('0');
        expect(document.querySelector('[data-part="label"]')?.textContent).toBe('Volume');
    });

    it('moves with the keyboard and Home/End', async () => {
        const slider = mountElement<NdSlider>('nd-slider', MARKUP, { value: '40' });
        await flush();
        const thumb = getPart<HTMLElement>(slider, '[data-part="thumb"]');

        thumb.focus();
        press(thumb, 'ArrowRight');
        await flush();
        expect(thumb.getAttribute('aria-valuenow')).toBe('41');

        press(thumb, 'Home');
        await flush();
        expect(thumb.getAttribute('aria-valuenow')).toBe('0');

        press(thumb, 'End');
        await flush();
        expect(thumb.getAttribute('aria-valuenow')).toBe('100');
    });

    it('sets the value programmatically', async () => {
        const slider = mountElement<NdSlider>('nd-slider', MARKUP, { value: '10' });
        await flush();
        const thumb = getPart<HTMLElement>(slider, '[data-part="thumb"]');

        slider.setValue(75);
        await flush();

        expect(thumb.getAttribute('aria-valuenow')).toBe('75');
        expect(slider.dataset.value).toBe('75');
    });

    it('is axe-clean', async () => {
        mountElement<NdSlider>('nd-slider', MARKUP, { value: '30' });
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
