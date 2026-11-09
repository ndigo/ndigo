/**
 * File upload: structure, selection, validation, delete/clear, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdFileUpload } from '../registry/ui/file-upload/nd-file-upload';

const MARKUP = `
    <label data-part="label">Attachments</label>
    <div data-part="dropzone">Drop files here or use the button below.</div>
    <button data-part="trigger" type="button">Choose files</button>
    <button data-part="clear-trigger" type="button">Clear</button>
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

function makeFile(name: string, type = 'text/plain'): File {
    return new File(['content'], name, { type });
}

function select(upload: NdFileUpload, files: File[]): void {
    const input = getPart<HTMLInputElement>(upload, '[data-part="hidden-input"]');
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function itemNames(upload: NdFileUpload): string[] {
    return [...upload.querySelectorAll<HTMLElement>('[data-part="item-name"]')].map((item) => item.textContent ?? '');
}

describe('<nd-file-upload>', () => {
    it('wires the dropzone, label, and hidden input', async () => {
        const upload = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { name: 'attachments' });
        await flush();
        const dropzone = getPart<HTMLElement>(upload, '[data-part="dropzone"]');
        const label = getPart<HTMLLabelElement>(upload, '[data-part="label"]');
        const hidden = getPart<HTMLInputElement>(upload, '[data-part="hidden-input"]');
        const clear = getPart<HTMLElement>(upload, '[data-part="clear-trigger"]');

        expect(upload).toBeInstanceOf(NdFileUpload);
        expect(dropzone.getAttribute('role')).toBe('button');
        expect(dropzone.tabIndex).toBe(0);
        expect(label.htmlFor).toBe(hidden.id);
        expect(hidden.type).toBe('file');
        expect(hidden.name).toBe('attachments');
        expect(clear.hasAttribute('hidden')).toBe(true);
        expect(getPart<HTMLElement>(upload, '[data-part="item-group"]')).not.toBeNull();
    });

    it('lists selected files and emits nd-file-change', async () => {
        const upload = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { 'max-files': '3' });
        await flush();
        const changes: number[] = [];
        upload.addEventListener('nd-file-change', (event) => {
            const detail = (event as CustomEvent<{ acceptedFiles: File[] }>).detail;
            changes.push(detail.acceptedFiles.length);
        });

        select(upload, [makeFile('report.txt'), makeFile('notes.txt')]);
        await flush();

        expect(itemNames(upload)).toEqual(['report.txt', 'notes.txt']);
        expect(upload.dataset.value).toBe('report.txt, notes.txt');
        expect(upload.dataset.count).toBe('2');
        expect(changes).toEqual([2]);
        expect(getPart<HTMLElement>(upload, '[data-part="clear-trigger"]').hasAttribute('hidden')).toBe(false);
    });

    it('rejects files outside the accept list', async () => {
        const upload = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { accept: 'image/*' });
        await flush();
        const rejected: File[][] = [];
        upload.addEventListener('nd-file-change', (event) => {
            const detail = (event as CustomEvent<{ rejectedFiles: { file: File }[] }>).detail;
            rejected.push(detail.rejectedFiles.map((entry) => entry.file));
        });

        select(upload, [makeFile('report.txt')]);
        await flush();

        expect(itemNames(upload)).toEqual([]);
        expect(upload.dataset.count).toBe('0');
        expect(rejected[0]?.map((file) => file.name)).toEqual(['report.txt']);
    });

    it('allows multiple files only above one', async () => {
        const single = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { 'max-files': '1' });
        await flush();
        expect(getPart<HTMLInputElement>(single, '[data-part="hidden-input"]').multiple).toBe(false);

        document.body.innerHTML = '';
        const multi = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { 'max-files': '3' });
        await flush();
        expect(getPart<HTMLInputElement>(multi, '[data-part="hidden-input"]').multiple).toBe(true);
    });

    it('removes a file and clears the list', async () => {
        const upload = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { 'max-files': '3' });
        await flush();
        select(upload, [makeFile('report.txt'), makeFile('notes.txt')]);
        await flush();

        getPart<HTMLElement>(upload, '[data-part="item"] [data-part="item-delete-trigger"]').click();
        await flush();
        expect(itemNames(upload)).toEqual(['notes.txt']);

        getPart<HTMLElement>(upload, '[data-part="clear-trigger"]').click();
        await flush();
        expect(itemNames(upload)).toEqual([]);
        expect(upload.dataset.value).toBe('');
    });

    it('keeps keyboard focus after deleting a file', async () => {
        const upload = mountElement<NdFileUpload>('nd-file-upload', MARKUP, { 'max-files': '3' });
        await flush();
        select(upload, [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);
        await flush();

        const deletes = upload.querySelectorAll<HTMLElement>('[data-part="item-delete-trigger"]');
        deletes[1]?.focus();
        deletes[1]?.click();
        await flush();

        expect(itemNames(upload)).toEqual(['a.txt', 'c.txt']);
        const remaining = upload.querySelectorAll<HTMLElement>('[data-part="item-delete-trigger"]');
        expect(document.activeElement).toBe(remaining[1]);
    });

    it('is axe-clean with files', async () => {
        const upload = mountElement<NdFileUpload>('nd-file-upload', MARKUP);
        await flush();
        select(upload, [makeFile('report.txt')]);
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
