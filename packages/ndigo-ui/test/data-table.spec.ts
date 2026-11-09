/**
 * Data table block: sorting, selection, pagination, and axe.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { initDataTable } from '../registry/blocks/data-table/data-table';
import type {
    DataTableHandle,
    DataTablePage,
    DataTableSelection,
    DataTableSort,
} from '../registry/blocks/data-table/data-table';

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry/blocks/data-table/data-table.html'))
);

if (!PACKAGE_ROOT) throw new Error(`Cannot locate the data table block from ${process.cwd()}`);

const HTML = readFileSync(join(PACKAGE_ROOT, 'registry/blocks/data-table/data-table.html'), 'utf8');

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

interface MountedTable {
    readonly handle: DataTableHandle;
    readonly root: HTMLElement;
}

function mount(): MountedTable {
    document.body.innerHTML = HTML;
    const handle = initDataTable(document);
    if (handle === null) throw new Error('data table did not initialize');
    return { handle, root: handle.root };
}

function visibleIds(root: HTMLElement): string[] {
    return [...root.querySelectorAll<HTMLTableRowElement>('tbody > tr')]
        .filter((row) => !row.hidden)
        .map((row) => row.dataset.rowId ?? '');
}

function rowByNumber(root: HTMLElement, number: string): HTMLTableRowElement {
    return root.querySelector<HTMLTableRowElement>(`tr[data-row-id="${number}"]`) as HTMLTableRowElement;
}

describe('data table block', () => {
    it('renders the first page and status', () => {
        const { root } = mount();

        expect(root.querySelector('[data-status]')?.textContent).toBe('Showing 1–3 of 6');
        expect(visibleIds(root)).toEqual(['INV-001', 'INV-002', 'INV-003']);
        expect(root.querySelector('[data-pagination] [aria-current="page"]')?.textContent).toBe('1');
    });

    it('sorts text columns and toggles direction', () => {
        const { root } = mount();
        const changes: DataTableSort[] = [];
        root.addEventListener('nd-sort-change', (event) => {
            changes.push((event as CustomEvent<DataTableSort>).detail);
        });
        const header = root.querySelector<HTMLElement>('th[data-sort-key="invoice"]');
        const button = header?.querySelector<HTMLButtonElement>('button');

        button?.click();
        expect(header?.getAttribute('aria-sort')).toBe('ascending');
        expect(visibleIds(root)[0]).toBe('INV-001');

        button?.click();
        expect(header?.getAttribute('aria-sort')).toBe('descending');
        expect(visibleIds(root)[0]).toBe('INV-006');

        expect(changes).toEqual([
            { key: 'invoice', direction: 'ascending' },
            { key: 'invoice', direction: 'descending' },
        ]);
    });

    it('sorts numeric columns by data-sort-value', () => {
        const { root } = mount();
        const button = root.querySelector<HTMLButtonElement>('th[data-sort-key="amount"] button');

        button?.click();
        expect(visibleIds(root)[0]).toBe('INV-006');

        button?.click();
        expect(visibleIds(root)[0]).toBe('INV-005');
    });

    it('pages through rows and emits nd-page-change', () => {
        const { root } = mount();
        const pages: DataTablePage[] = [];
        root.addEventListener('nd-page-change', (event) => {
            pages.push((event as CustomEvent<DataTablePage>).detail);
        });

        root.querySelector<HTMLButtonElement>('[data-pagination] button[data-page="2"]')?.click();

        expect(visibleIds(root)).toEqual(['INV-004', 'INV-005', 'INV-006']);
        expect(root.querySelector('[data-status]')?.textContent).toBe('Showing 4–6 of 6');
        expect(root.querySelector('[data-pagination] [aria-current="page"]')?.textContent).toBe('2');
        expect(pages).toEqual([{ page: 2, pageCount: 2 }]);
    });

    it('selects rows and tracks the header state across pages', () => {
        const { root } = mount();
        const selections: DataTableSelection[] = [];
        root.addEventListener('nd-selection-change', (event) => {
            selections.push((event as CustomEvent<DataTableSelection>).detail);
        });
        const selectAll = root.querySelector<HTMLInputElement>('[data-select-all]');

        root.querySelector<HTMLInputElement>('tr[data-row-id="INV-001"] [data-select-row]')?.click();
        expect(rowByNumber(root, 'INV-001').hasAttribute('data-selected')).toBe(true);
        expect(selectAll?.indeterminate).toBe(true);
        expect(selections.at(-1)?.ids).toEqual(['INV-001']);

        selectAll?.click();
        expect(selections.at(-1)?.ids).toEqual(['INV-001', 'INV-002', 'INV-003']);
        expect(selectAll?.checked).toBe(true);

        root.querySelector<HTMLButtonElement>('[data-pagination] button[data-page="2"]')?.click();
        selectAll?.click();
        expect(selections.at(-1)?.ids).toEqual(['INV-001', 'INV-002', 'INV-003', 'INV-004', 'INV-005', 'INV-006']);
        expect(root.querySelectorAll('tr[data-selected]')).toHaveLength(6);
    });

    it('supports programmatic sort and page changes', () => {
        const { handle, root } = mount();

        handle.sort('customer', 'descending');
        expect(visibleIds(root)[0]).toBe('INV-004');

        handle.setPage(2);
        expect(visibleIds(root)).toEqual(['INV-005', 'INV-002', 'INV-001']);
        expect(handle.selectedIds()).toEqual([]);
    });

    it('is axe-clean', async () => {
        const { handle } = mount();
        handle.sort('amount');

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
