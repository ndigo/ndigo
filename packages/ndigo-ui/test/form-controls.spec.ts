/**
 * Native form tier: token-only CSS and an axe-clean form fixture.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry'))
);

if (!PACKAGE_ROOT) throw new Error(`Cannot locate packages/ndigo-ui from ${process.cwd()}`);

const INPUT_CSS = readFileSync(join(PACKAGE_ROOT, 'registry/ui/input/nd-input.css'), 'utf8');
const FIELD_CSS = readFileSync(join(PACKAGE_ROOT, 'registry/ui/field/nd-field.css'), 'utf8');
const CHECKBOX_CSS = readFileSync(join(PACKAGE_ROOT, 'registry/ui/checkbox/nd-checkbox.css'), 'utf8');

const FORM = `
    <form novalidate>
        <div class="nd-field">
            <label class="nd-label" for="name" data-required>Name</label>
            <input class="nd-input" id="name" name="name" autocomplete="name" required aria-describedby="name-help" />
            <p class="nd-help" id="name-help">The name shown on your profile.</p>
        </div>
        <div class="nd-field">
            <label class="nd-label" for="email">Email</label>
            <input class="nd-input" id="email" name="email" type="email" aria-invalid="true" aria-describedby="email-error" />
            <p class="nd-error" id="email-error">Enter a valid email address.</p>
        </div>
        <div class="nd-field">
            <label class="nd-label" for="notes">Notes</label>
            <textarea class="nd-textarea" id="notes" name="notes" aria-describedby="notes-help"></textarea>
            <p class="nd-help" id="notes-help">Optional context for the team.</p>
        </div>
        <fieldset class="nd-choice-group">
            <legend class="nd-label">Preferences</legend>
            <label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="updates" checked />
                <span class="nd-label">Product updates</span>
            </label>
            <label class="nd-choice">
                <input class="nd-radio" type="radio" name="plan" value="free" checked />
                <span class="nd-label">Free</span>
            </label>
            <label class="nd-choice">
                <input class="nd-radio" type="radio" name="plan" value="pro" />
                <span class="nd-label">Pro</span>
            </label>
        </fieldset>
    </form>
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

describe('native form CSS', () => {
    it('is token-only: no raw colors, gradients, or asset URLs', () => {
        for (const css of [INPUT_CSS, FIELD_CSS, CHECKBOX_CSS]) {
            expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
            expect(css).not.toMatch(/\b(?:rgb|hsl)a?\(/);
            expect(css).not.toMatch(/url\(/);
            expect(css).toContain('var(--nd-');
        }
    });

    it('covers the input states', () => {
        expect(INPUT_CSS).toContain('.nd-input');
        expect(INPUT_CSS).toContain('.nd-textarea');
        expect(INPUT_CSS).toContain(':focus-visible');
        expect(INPUT_CSS).toContain(':disabled');
        expect(INPUT_CSS).toContain("[aria-invalid='true']");
        expect(INPUT_CSS).toContain('prefers-reduced-motion');
    });

    it('covers the field parts', () => {
        expect(FIELD_CSS).toContain('.nd-field');
        expect(FIELD_CSS).toContain('.nd-label');
        expect(FIELD_CSS).toContain('.nd-help');
        expect(FIELD_CSS).toContain('.nd-error');
        expect(FIELD_CSS).toContain('[data-required]');
        expect(FIELD_CSS).toContain(":has([aria-invalid='true'])");
    });

    it('covers the choice controls', () => {
        expect(CHECKBOX_CSS).toContain('.nd-checkbox');
        expect(CHECKBOX_CSS).toContain('.nd-radio');
        expect(CHECKBOX_CSS).toContain('.nd-choice');
        expect(CHECKBOX_CSS).toContain('.nd-choice-group');
        expect(CHECKBOX_CSS).toContain('accent-color');
        expect(CHECKBOX_CSS).toContain(':focus-visible');
    });
});

describe('native form fixture', () => {
    it('wires labels, help text, and the invalid state', () => {
        document.body.innerHTML = FORM;

        expect(document.querySelectorAll('label.nd-label[for]')).toHaveLength(3);
        expect(document.querySelector('#name')?.getAttribute('aria-describedby')).toBe('name-help');
        expect(document.querySelector('#email')?.getAttribute('aria-invalid')).toBe('true');
        expect(document.querySelectorAll('.nd-checkbox, .nd-radio')).toHaveLength(3);
    });

    it('is axe-clean', async () => {
        document.body.innerHTML = FORM;

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
