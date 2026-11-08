/**
 * Native button contract: token-only CSS, full variant/size coverage, and an
 * axe-clean rendered set.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry'))
);

if (!PACKAGE_ROOT) {
    throw new Error(`Cannot locate packages/ndigo-ui from ${process.cwd()}`);
}

const BUTTON_CSS = readFileSync(join(PACKAGE_ROOT, 'registry/ui/button/nd-button.css'), 'utf8');

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

describe('nd-button contract', () => {
    it('is token-only: no raw colors, gradients, or asset URLs', () => {
        expect(BUTTON_CSS).not.toMatch(/#[0-9a-f]{3,8}\b/i);
        expect(BUTTON_CSS).not.toMatch(/\b(?:rgb|hsl)a?\(/);
        expect(BUTTON_CSS).not.toMatch(/url\(/);
        expect(BUTTON_CSS).toContain('var(--nd-');
    });

    it('defines every variant', () => {
        for (const variant of ['primary', 'secondary', 'ghost', 'danger']) {
            expect(BUTTON_CSS).toContain(`[data-variant='${variant}']`);
        }
    });

    it('defines every size', () => {
        for (const size of ['sm', 'lg']) {
            expect(BUTTON_CSS).toContain(`[data-size='${size}']`);
        }
    });

    it('covers focus, disabled, and reduced motion', () => {
        expect(BUTTON_CSS).toContain(':focus-visible');
        expect(BUTTON_CSS).toContain(':disabled');
        expect(BUTTON_CSS).toContain("aria-disabled='true'");
        expect(BUTTON_CSS).toContain('prefers-reduced-motion');
    });
});

describe('nd-button accessibility', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('is axe-clean across variants', async () => {
        document.body.innerHTML = `
            <button class="nd-button" data-variant="primary">Save</button>
            <button class="nd-button" data-variant="secondary">Cancel</button>
            <button class="nd-button" data-variant="ghost">Skip</button>
            <button class="nd-button" data-variant="danger">Delete</button>
            <button class="nd-button" disabled>Disabled</button>
        `;

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
