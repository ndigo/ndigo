/**
 * Toast: live-region contract, show/hide, auto-dismiss, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdToast } from '../registry/ui/toast/nd-toast';

const MARKUP = `
    <span data-part="title">Saved</span>
    <span data-part="description">Your changes are live.</span>
    <button data-part="close-trigger">Dismiss</button>
`;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
});

describe('<nd-toast>', () => {
    it('is a hidden live region until shown', async () => {
        const toast = mountElement<NdToast>('nd-toast', MARKUP, { type: 'success', duration: '0' });
        await flush();

        expect(toast).toBeInstanceOf(NdToast);
        expect(toast.hidden).toBe(true);
        expect(toast.getAttribute('role')).toBe('status');
        expect(toast.getAttribute('aria-live')).toBe('polite');
        expect(toast.getAttribute('aria-atomic')).toBe('true');
    });

    it('shows and hides with open-change events', async () => {
        const toast = mountElement<NdToast>('nd-toast', MARKUP, { duration: '0' });
        await flush();
        const changes: boolean[] = [];
        toast.addEventListener('nd-open-change', (event) => {
            changes.push((event as CustomEvent<{ open: boolean }>).detail.open);
        });

        toast.show();
        await flush();
        expect(toast.hidden).toBe(false);
        expect(toast.getAttribute('data-state')).toBe('open');

        toast.hide();
        await flush();
        expect(toast.hidden).toBe(true);
        expect(changes).toEqual([true, false]);
    });

    it('hides from the close trigger', async () => {
        const toast = mountElement<NdToast>('nd-toast', MARKUP, { duration: '0' });
        await flush();
        toast.show();
        await flush();

        getPart<HTMLElement>(toast, '[data-part="close-trigger"]').click();
        await flush();

        expect(toast.hidden).toBe(true);
    });

    it('auto-dismisses after the duration', async () => {
        vi.useFakeTimers();
        const toast = mountElement<NdToast>('nd-toast', MARKUP, { duration: '1000' });
        await Promise.resolve();

        toast.show();
        expect(toast.hidden).toBe(false);
        vi.advanceTimersByTime(1000);

        expect(toast.hidden).toBe(true);
    });

    it('uses alert semantics for errors', async () => {
        mountElement<NdToast>('nd-toast', MARKUP, { type: 'error', duration: '0' });
        await Promise.resolve();

        const toast = document.querySelector('nd-toast');
        expect(toast?.getAttribute('role')).toBe('alert');
        expect(toast?.getAttribute('aria-live')).toBe('assertive');
    });

    it('is axe-clean when shown', async () => {
        const toast = mountElement<NdToast>('nd-toast', MARKUP, { duration: '0' });
        await flush();
        toast.show();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
