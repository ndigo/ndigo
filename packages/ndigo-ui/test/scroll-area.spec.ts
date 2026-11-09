/**
 * Scroll area: structure creation, machine wiring, methods, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdScrollArea } from '../registry/ui/scroll-area/nd-scroll-area';

const MARKUP = `
    <div data-part="root">
        <div data-part="viewport">
            <div data-part="content"><p>Long content</p></div>
        </div>
        <div data-part="scrollbar" data-orientation="vertical"><div data-part="thumb"></div></div>
        <div data-part="scrollbar" data-orientation="horizontal"><div data-part="thumb"></div></div>
        <div data-part="corner"></div>
    </div>
`;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-scroll-area>', () => {
    it('wraps authored content in root, viewport, and content', async () => {
        const area = mountElement<NdScrollArea>('nd-scroll-area', '<p>Long content</p>');
        await flush();

        const root = getPart<HTMLElement>(area, '[data-part="root"]');
        const viewport = getPart<HTMLElement>(area, '[data-part="viewport"]');
        const content = getPart<HTMLElement>(area, '[data-part="content"]');
        const vertical = getPart<HTMLElement>(area, '[data-part="scrollbar"][data-orientation="vertical"]');
        const horizontal = getPart<HTMLElement>(area, '[data-part="scrollbar"][data-orientation="horizontal"]');
        const corner = getPart<HTMLElement>(area, '[data-part="corner"]');

        expect(area).toBeInstanceOf(NdScrollArea);
        expect(root.getAttribute('role')).toBe('presentation');
        expect(root.contains(viewport)).toBe(true);
        expect(viewport.contains(content)).toBe(true);
        expect(content.textContent).toBe('Long content');
        expect(vertical.querySelector('[data-part="thumb"]')).not.toBeNull();
        expect(horizontal.querySelector('[data-part="thumb"]')).not.toBeNull();
        expect(corner).not.toBeNull();
    });

    it('keeps an authored structure intact', async () => {
        const area = mountElement<NdScrollArea>('nd-scroll-area', MARKUP);
        await flush();

        expect(area.querySelectorAll('[data-part="root"]')).toHaveLength(1);
        expect(area.querySelectorAll('[data-part="viewport"]')).toHaveLength(1);
        expect(area.querySelectorAll('[data-part="content"]')).toHaveLength(1);
        expect(area.querySelectorAll('[data-part="scrollbar"]')).toHaveLength(2);
        expect(getPart<HTMLElement>(area, '[data-part="viewport"]').getAttribute('data-ownedby')).toBe(
            getPart<HTMLElement>(area, '[data-part="root"]').id
        );
    });

    it('exposes programmatic scrolling', async () => {
        const area = mountElement<NdScrollArea>('nd-scroll-area', MARKUP);
        await flush();

        expect(() => area.scrollTo({ top: 100, left: 0 })).not.toThrow();
        expect(() => area.scrollToEdge({ edge: 'bottom' })).not.toThrow();
    });

    it('is axe-clean', async () => {
        mountElement<NdScrollArea>('nd-scroll-area', MARKUP);
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
