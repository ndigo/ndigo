/**
 * Data table block glue.
 *
 * Client-side sorting, page-local selection, and pagination over authored
 * rows. No runtime dependency: the table, checkbox, and pagination items
 * provide the styles, and this module owns the interactions.
 */

/** Payload of `nd-selection-change`. */
export interface DataTableSelection {
    /** `data-row-id` values (or row indexes) of every selected row. */
    readonly ids: string[];
}

/** Payload of `nd-sort-change`. */
export interface DataTableSort {
    readonly key: string;
    readonly direction: 'ascending' | 'descending';
}

/** Payload of `nd-page-change`. */
export interface DataTablePage {
    readonly page: number;
    readonly pageCount: number;
}

/** Handle returned by {@link initDataTable}. */
export interface DataTableHandle {
    readonly root: HTMLElement;
    sort(key: string, direction?: 'ascending' | 'descending'): void;
    setPage(page: number): void;
    selectedIds(): string[];
    refresh(): void;
    destroy(): void;
}

type SortDirection = 'ascending' | 'descending';

const ELLIPSIS = '…';
const PAGE_WINDOW = 7;

/**
 * Wires one data table rendered from `data-table.html`.
 * @param root - Document or container that holds the `[data-data-table]` block.
 * @returns The table handle, or `null` when the markup is absent.
 */
export function initDataTable(root: ParentNode): DataTableHandle | null {
    const container = root.querySelector<HTMLElement>('[data-data-table]');
    if (container === null) return null;

    const tbody = container.querySelector<HTMLElement>('[data-rows]');
    if (tbody === null) return null;

    const selectAll = container.querySelector<HTMLInputElement>('[data-select-all]');
    const pagination = container.querySelector<HTMLElement>('[data-pagination]');
    const status = container.querySelector<HTMLElement>('[data-status]');
    const pageSize = Math.max(1, Number(container.dataset.pageSize) || 10);

    let page = 1;
    let sortKey: string | null = null;
    let sortDirection: SortDirection = 'ascending';
    let originalOrder = new Map<HTMLTableRowElement, number>();

    const controller = new AbortController();
    const signal = controller.signal;

    const rows = (): HTMLTableRowElement[] => [...tbody.querySelectorAll<HTMLTableRowElement>(':scope > tr')];

    const recordOrder = (): void => {
        if (originalOrder.size > 0) return;
        originalOrder = new Map(rows().map((row, index) => [row, index]));
    };

    const sortHeader = (key: string): HTMLTableCellElement | null =>
        [...container.querySelectorAll<HTMLTableCellElement>('th[data-sort-key]')].find(
            (header) => header.dataset.sortKey === key
        ) ?? null;

    const cellValue = (row: HTMLTableRowElement, index: number, type: string): string | number => {
        const cell = row.cells[index];
        const raw = cell?.getAttribute('data-sort-value') ?? cell?.textContent?.trim() ?? '';
        if (type === 'number') return Number(raw) || 0;
        if (type === 'date') return Date.parse(raw) || 0;
        return raw.toLocaleLowerCase();
    };

    const compareRows = (a: HTMLTableRowElement, b: HTMLTableRowElement, index: number, type: string): number => {
        const left = cellValue(a, index, type);
        const right = cellValue(b, index, type);
        const comparison =
            typeof left === 'number' && typeof right === 'number'
                ? left - right
                : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
        return (
            comparison * (sortDirection === 'ascending' ? 1 : -1) ||
            (originalOrder.get(a) ?? 0) - (originalOrder.get(b) ?? 0)
        );
    };

    const applySort = (): void => {
        if (sortKey === null) return;
        const header = sortHeader(sortKey);
        if (header === null) return;
        const type = header.dataset.sortType ?? 'text';
        tbody.append(...rows().sort((a, b) => compareRows(a, b, header.cellIndex, type)));
    };

    const updateSortHeaders = (): void => {
        for (const header of container.querySelectorAll<HTMLElement>('th[data-sort-key]')) {
            const active = header.dataset.sortKey === sortKey;
            if (active) header.setAttribute('aria-sort', sortDirection);
            else header.removeAttribute('aria-sort');
            const icon = header.querySelector<HTMLElement>('.nd-table__sort-icon');
            if (icon) icon.textContent = active ? (sortDirection === 'ascending' ? '↑' : '↓') : '↕';
        }
    };

    const pageRows = (): HTMLTableRowElement[] => rows().filter((row) => !row.hidden);

    const selectedIds = (): string[] =>
        rows()
            .map((row, index) => ({ row, id: row.dataset.rowId ?? String(index) }))
            .filter(({ row }) => row.hasAttribute('data-selected'))
            .map(({ id }) => id);

    const emit = <T>(type: string, detail: T): void => {
        container.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true }));
    };

    const updateSelectAll = (): void => {
        if (selectAll === null) return;
        const visible = pageRows();
        const checked = visible.filter((row) => row.hasAttribute('data-selected')).length;
        selectAll.checked = visible.length > 0 && checked === visible.length;
        selectAll.indeterminate = checked > 0 && checked < visible.length;
        selectAll.disabled = visible.length === 0;
    };

    const pageWindow = (current: number, count: number): (number | typeof ELLIPSIS)[] => {
        if (count <= PAGE_WINDOW) return Array.from({ length: count }, (_, index) => index + 1);
        const wanted = new Set([1, count, current, current - 1, current + 1]);
        const pages = [...wanted].filter((value) => value >= 1 && value <= count).sort((a, b) => a - b);
        const out: (number | typeof ELLIPSIS)[] = [];
        let previous = 0;
        for (const value of pages) {
            if (previous > 0 && value - previous > 1) out.push(ELLIPSIS);
            out.push(value);
            previous = value;
        }
        return out;
    };

    interface PaginationFocus {
        readonly page: string | undefined;
        readonly direction: string | undefined;
    }

    const capturePaginationFocus = (): PaginationFocus | null => {
        if (pagination === null) return null;
        const active = pagination.ownerDocument.activeElement;
        if (!(active instanceof HTMLElement) || !pagination.contains(active)) return null;
        return { page: active.dataset.page, direction: active.dataset.direction };
    };

    const restorePaginationFocus = (focus: PaginationFocus | null): void => {
        if (pagination === null || focus === null) return;
        const selector =
            focus.page !== undefined
                ? `button[data-page="${focus.page}"]`
                : focus.direction !== undefined
                  ? `button[data-direction="${focus.direction}"]`
                  : null;
        if (selector !== null) {
            const button = pagination.querySelector<HTMLButtonElement>(selector);
            if (button !== null && !button.disabled) {
                button.focus();
                return;
            }
        }
        // The focused page became the current page (or an edge became disabled).
        // Focus the current-page indicator so the keyboard position is kept.
        const current = pagination.querySelector<HTMLElement>('[aria-current="page"]');
        if (current !== null) {
            current.tabIndex = -1;
            current.focus();
            return;
        }
        pagination.tabIndex = -1;
        pagination.focus();
    };

    const renderPagination = (pageCount: number): void => {
        if (pagination === null) return;
        const focus = capturePaginationFocus();
        const list = pagination.ownerDocument.createElement('ul');
        list.className = 'nd-pagination__list';

        const edge = (label: string, target: number, disabled: boolean, direction: string): HTMLLIElement => {
            const item = pagination.ownerDocument.createElement('li');
            const button = pagination.ownerDocument.createElement('button');
            button.type = 'button';
            button.className = 'nd-pagination__link';
            button.dataset.direction = direction;
            button.dataset.page = String(target);
            button.disabled = disabled;
            button.textContent = label;
            item.append(button);
            return item;
        };

        list.append(edge('‹ Previous', page - 1, page === 1, 'previous'));
        for (const value of pageWindow(page, pageCount)) {
            const item = pagination.ownerDocument.createElement('li');
            if (value === ELLIPSIS) {
                const ellipsis = pagination.ownerDocument.createElement('span');
                ellipsis.className = 'nd-pagination__ellipsis';
                ellipsis.setAttribute('aria-hidden', 'true');
                ellipsis.textContent = ELLIPSIS;
                item.append(ellipsis);
            } else if (value === page) {
                const current = pagination.ownerDocument.createElement('span');
                current.className = 'nd-pagination__link';
                current.setAttribute('aria-current', 'page');
                current.textContent = String(value);
                item.append(current);
            } else {
                const button = pagination.ownerDocument.createElement('button');
                button.type = 'button';
                button.className = 'nd-pagination__link';
                button.dataset.page = String(value);
                button.setAttribute('aria-label', `Page ${value}`);
                button.textContent = String(value);
                item.append(button);
            }
            list.append(item);
        }
        list.append(edge('Next ›', page + 1, page === pageCount, 'next'));
        pagination.replaceChildren(list);
        restorePaginationFocus(focus);
    };

    const updateStatus = (total: number, start: number, end: number): void => {
        if (status === null) return;
        status.textContent = total === 0 ? 'No rows' : `Showing ${start + 1}–${end} of ${total}`;
    };

    const render = (): void => {
        recordOrder();
        applySort();
        const all = rows();
        const pageCount = Math.max(1, Math.ceil(all.length / pageSize));
        page = Math.min(Math.max(1, page), pageCount);
        const start = (page - 1) * pageSize;
        const end = Math.min(start + pageSize, all.length);
        all.forEach((row, index) => {
            row.hidden = index < start || index >= end;
        });
        updateStatus(all.length, start, end);
        updateSortHeaders();
        renderPagination(pageCount);
        updateSelectAll();
    };

    const setSort = (key: string, direction: SortDirection): void => {
        sortKey = key;
        sortDirection = direction;
        page = 1;
        render();
        emit<DataTableSort>('nd-sort-change', { key, direction });
    };

    const setPage = (next: number): void => {
        const pageCount = Math.max(1, Math.ceil(rows().length / pageSize));
        const clamped = Math.min(Math.max(1, next), pageCount);
        if (clamped === page) return;
        page = clamped;
        render();
        emit<DataTablePage>('nd-page-change', { page, pageCount });
    };

    for (const header of container.querySelectorAll<HTMLElement>('th[data-sort-key]')) {
        const button = header.querySelector<HTMLButtonElement>('button');
        if (button === null) continue;
        button.addEventListener(
            'click',
            () => {
                const key = header.dataset.sortKey;
                if (key === undefined) return;
                const direction: SortDirection =
                    sortKey === key && sortDirection === 'ascending' ? 'descending' : 'ascending';
                setSort(key, direction);
            },
            { signal }
        );
    }

    if (selectAll !== null) {
        const selectAllInput = selectAll;
        selectAllInput.addEventListener(
            'change',
            () => {
                for (const row of pageRows()) {
                    const checkbox = row.querySelector<HTMLInputElement>('[data-select-row]');
                    if (checkbox) checkbox.checked = selectAllInput.checked;
                    row.toggleAttribute('data-selected', selectAllInput.checked);
                }
                updateSelectAll();
                emit<DataTableSelection>('nd-selection-change', { ids: selectedIds() });
            },
            { signal }
        );
    }

    tbody.addEventListener(
        'change',
        (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !target.matches('[data-select-row]')) return;
            const row = target.closest('tr');
            if (row === null) return;
            row.toggleAttribute('data-selected', target.checked);
            updateSelectAll();
            emit<DataTableSelection>('nd-selection-change', { ids: selectedIds() });
        },
        { signal }
    );

    pagination?.addEventListener(
        'click',
        (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const button = target.closest<HTMLButtonElement>('button[data-page]');
            if (button === null || button.disabled) return;
            setPage(Number(button.dataset.page));
        },
        { signal }
    );

    render();

    return {
        root: container,
        sort(key, direction = 'ascending'): void {
            setSort(key, direction);
        },
        setPage,
        selectedIds,
        refresh(): void {
            originalOrder.clear();
            render();
        },
        destroy(): void {
            controller.abort();
        },
    };
}
