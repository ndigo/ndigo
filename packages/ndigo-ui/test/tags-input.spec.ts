/**
 * Tags input: structure, add/remove, clear, max, hidden value, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdTagsInput } from '../registry/ui/tags-input/nd-tags-input';

const MARKUP = `
    <label data-part="label">Tags</label>
    <div data-part="control">
        <input data-part="input" placeholder="Add a tag" />
        <button data-part="clear-trigger" type="button">Clear</button>
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

function previews(picker: NdTagsInput): string[] {
    return [...picker.querySelectorAll<HTMLElement>('[data-part="item-text"]')].map((item) => item.textContent ?? '');
}

describe('<nd-tags-input>', () => {
    it('renders the initial tags and hidden value', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha,beta', name: 'tags' });
        await flush();
        const field = getPart<HTMLInputElement>(input, '[data-part="input"]');
        const hidden = getPart<HTMLInputElement>(input, '[data-part="hidden-input"]');
        const label = getPart<HTMLLabelElement>(input, '[data-part="label"]');

        expect(input).toBeInstanceOf(NdTagsInput);
        expect(previews(input)).toEqual(['alpha', 'beta']);
        expect(input.dataset.value).toBe('alpha, beta');
        expect(hidden.value).toBe('alpha, beta');
        expect(hidden.name).toBe('tags');
        expect(label.htmlFor).toBe(field.id);
        expect(getPart<HTMLElement>(input, '[data-part="clear-trigger"]').hasAttribute('hidden')).toBe(false);
    });

    it('adds a tag on Enter', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha' });
        await flush();
        const values: string[][] = [];
        input.addEventListener('nd-value-change', (event) => {
            values.push((event as CustomEvent<{ value: string[] }>).detail.value);
        });
        const field = getPart<HTMLInputElement>(input, '[data-part="input"]');

        field.focus();
        await flush();
        field.value = 'gamma';
        field.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();
        field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await flush();

        expect(previews(input)).toEqual(['alpha', 'gamma']);
        expect(input.dataset.value).toBe('alpha, gamma');
        expect(getPart<HTMLInputElement>(input, '[data-part="hidden-input"]').value).toBe('alpha, gamma');
        expect(values).toEqual([['alpha', 'gamma']]);
        expect(field.value).toBe('');
    });

    it('removes a tag from its delete trigger', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha,beta' });
        await flush();

        getPart<HTMLElement>(input, '[data-part="item"][data-value="alpha"] [data-part="item-delete-trigger"]').click();
        await flush();

        expect(previews(input)).toEqual(['beta']);
        expect(input.dataset.value).toBe('beta');
        expect(getPart<HTMLInputElement>(input, '[data-part="hidden-input"]').value).toBe('beta');
    });

    it('enforces the max tag count', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha,beta', max: '2' });
        await flush();
        const field = getPart<HTMLInputElement>(input, '[data-part="input"]');

        field.focus();
        await flush();
        field.value = 'gamma';
        field.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();
        field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await flush();

        expect(previews(input)).toEqual(['alpha', 'beta']);
        expect(input.dataset.value).toBe('alpha, beta');
    });

    it('clears every tag', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha,beta' });
        await flush();

        getPart<HTMLElement>(input, '[data-part="clear-trigger"]').click();
        await flush();

        expect(previews(input)).toEqual([]);
        expect(input.dataset.value).toBe('');
        expect(getPart<HTMLInputElement>(input, '[data-part="hidden-input"]').value).toBe('');
        expect(getPart<HTMLElement>(input, '[data-part="clear-trigger"]').hasAttribute('hidden')).toBe(true);
    });

    it('supports add, remove, and clear programmatically', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha' });
        await flush();

        input.add('beta');
        await flush();
        expect(previews(input)).toEqual(['alpha', 'beta']);

        input.removeTag('alpha');
        await flush();
        expect(previews(input)).toEqual(['beta']);

        input.clear();
        await flush();
        expect(previews(input)).toEqual([]);
    });

    it('is axe-clean with tags', async () => {
        const input = mountElement<NdTagsInput>('nd-tags-input', MARKUP, { value: 'alpha,beta' });
        await flush();
        getPart<HTMLElement>(input, '[data-part="input"]').focus();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
