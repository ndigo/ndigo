# nd-data-table

> Sortable, selectable, paged table built from the table, checkbox, button, and pagination items.

The block is authored rows plus a small glue module. Sorting, page-local
selection, and pagination run on the client; the markup and styles compose the
items already shipped, so there is no table runtime dependency.

## Usage

```ts
import { initDataTable } from './components/data-table/data-table';

const table = initDataTable(document);
```

`initDataTable(document)` finds `[data-data-table]` and returns a handle, or
`null` when the markup is absent.

```html
<div class="nd-data-table" data-data-table data-page-size="3">
    <div class="nd-table-wrap">
        <table class="nd-table nd-table--striped">
            <caption class="nd-table__caption">
                Invoices
            </caption>
            <thead>
                <tr>
                    <th scope="col" class="nd-data-table__select">
                        <input
                            class="nd-checkbox"
                            type="checkbox"
                            data-select-all
                            aria-label="Select all rows on this page"
                        />
                    </th>
                    <th scope="col" data-sort-key="invoice" data-sort-type="text">
                        <button class="nd-table__sort" type="button">
                            Invoice
                            <span class="nd-table__sort-icon" aria-hidden="true">↕</span>
                        </button>
                    </th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody data-rows>
                <tr data-row-id="INV-001">
                    <td class="nd-data-table__select">
                        <input class="nd-checkbox" type="checkbox" data-select-row aria-label="Select INV-001" />
                    </td>
                    <td data-sort-value="INV-001">INV-001</td>
                    <td>Paid</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="nd-data-table__footer">
        <p class="nd-data-table__status" data-status role="status" aria-live="polite"></p>
        <nav class="nd-pagination" data-pagination aria-label="Invoice pages"></nav>
    </div>
</div>
```

## Markup contract

| Hook                                   | Purpose                                                                                        |
| :------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `[data-data-table]`                    | Block root; `data-page-size` sets rows per page (default `10`)                                 |
| `[data-rows]`                          | `<tbody>` that owns the rows                                                                   |
| `[data-row-id]`                        | Stable row id used by selection                                                                |
| `[data-sort-key]` + `[data-sort-type]` | Sortable `<th>`; the button inside triggers sorting. Types: `text` (default), `number`, `date` |
| `[data-sort-value]`                    | Cell sort value when the display text is formatted (amounts, dates)                            |
| `[data-select-all]`                    | Header checkbox; selects the current page                                                      |
| `[data-select-row]`                    | Row checkbox                                                                                   |
| `[data-status]`                        | Live range text                                                                                |
| `[data-pagination]`                    | Empty `<nav>` that the glue fills                                                              |

## Methods

- `sort(key, direction?)` — sort by a `data-sort-key`; defaults to `ascending`.
- `setPage(page)` — move to a page.
- `selectedIds()` — ids of every selected row across pages.
- `refresh()` — re-read rows (call after replacing the tbody contents).
- `destroy()` — remove the glue's listeners.

## Events

- `nd-sort-change` — `{ key, direction }`.
- `nd-selection-change` — `{ ids: string[] }` for all selected rows.
- `nd-page-change` — `{ page, pageCount }`.

## Behaviour

Sorting reads the cell at the header's column index from `data-sort-value` or
the trimmed text. Numbers use `number`, dates `Date.parse`, and text
`localeCompare` with numeric collation. Sorting reorders all rows, keeps a stable
tie-break, and returns to page 1.

The header checkbox selects the rows on the current page; selections survive
sorting and paging, and the footer count reflects every selected row. Rows outside
the current page stay in the DOM with `hidden`, so their state is preserved.

## Accessibility

Sortable headers carry `aria-sort`; the icon is `aria-hidden` and the button
keeps the column label. The status line is a polite live region. Every row
checkbox has a per-row `aria-label`, and the header checkbox describes its
page scope. Generated page controls expose `aria-current="page"` and disabled
edges, matching the pagination item.

## Styling

Import `nd-table.css`, `nd-checkbox.css`, `nd-button.css`,
`nd-pagination.css`, and `data-table.css`. The block only adds the footer
layout, the select-column width, and the hidden-row rule; the table and
pagination keep their own tokens.
