/**
 * App-shell contract: landmark structure, token-only CSS, and axe.
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

const SHELL_HTML = readFileSync(join(PACKAGE_ROOT, 'registry/blocks/app-shell/app-shell.html'), 'utf8');
const SHELL_CSS = readFileSync(join(PACKAGE_ROOT, 'registry/blocks/app-shell/app-shell.css'), 'utf8');

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

describe('nd-app-shell contract', () => {
    it('is token-only: no raw colors, gradients, or asset URLs', () => {
        expect(SHELL_CSS).not.toMatch(/#[0-9a-f]{3,8}\b/i);
        expect(SHELL_CSS).not.toMatch(/\b(?:rgb|hsl)a?\(/);
        expect(SHELL_CSS).not.toMatch(/url\(/);
        expect(SHELL_CSS).toContain('var(--nd-');
    });

    it('keeps the landmark and skip-link contract', () => {
        document.body.innerHTML = SHELL_HTML;

        const main = document.querySelector('main');
        const skip = document.querySelector<HTMLAnchorElement>('.nd-skip-link');

        expect(document.querySelectorAll('main')).toHaveLength(1);
        expect(main?.id).toBe('nd-main');
        expect(main?.getAttribute('tabindex')).toBe('-1');
        expect(skip?.getAttribute('href')).toBe('#nd-main');
        expect(document.querySelectorAll('nav[aria-label]')).toHaveLength(2);
        expect(document.querySelector('header')).not.toBeNull();
        expect(document.querySelector('footer')).not.toBeNull();
        expect(document.querySelector('h1')).not.toBeNull();
    });

    it('is axe-clean', async () => {
        document.body.innerHTML = SHELL_HTML;

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
