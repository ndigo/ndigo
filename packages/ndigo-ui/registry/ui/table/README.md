# nd-table

> Native table styles with an overflow wrapper, sortable headers, and numeric alignment.

The table is markup plus CSS, not a custom element. It server-renders anywhere
and keeps the native table semantics that screen readers and browser find-in-page
already understand.

## Usage

```html
<div class="nd-table-wrap">
    <table class="nd-table">
        <caption class="nd-table__caption">
            Open invoices
        </caption>
        <thead>
            <tr>
                <th scope="col">Invoice</th>
                <th scope="col">Customer</th>
                <th scope="col" aria-sort="ascending">
                    <button class="nd-table__sort" type="button">
                        Amount
                        <span class="nd-table__sort-icon" aria-hidden="true">↑</span>
                    </button>
                </th>
                <th scope="col" data-numeric>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>INV-001</td>
                <td>Acme</td>
                <td data-numeric>$1,200.00</td>
                <td data-numeric>$1,200.00</td>
            </tr>
            <tr>
                <td>INV-002</td>
                <td>Globex</td>
                <td data-numeric>$840.00</td>
                <td data-numeric>$840.00</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">Total</td>
                <td data-numeric>$2,040.00</td>
            </tr>
        </tfoot>
    </table>
</div>
```

The wrapper owns the horizontal scroll on narrow screens, so the table keeps its
natural column widths.

## Sortable headers

Put `aria-sort` on the `<th>` (`ascending`, `descending`, or `none`) and make the
label a button. The consumer updates `aria-sort` and the icon when sorting
changes; the stylesheet only reflects the state. Keep the arrow inside
`aria-hidden="true"` so the button's accessible name stays the column label.

## Modifiers

| Class                | Effect                                               |
| :------------------- | :--------------------------------------------------- |
| `.nd-table--striped` | Tints even rows with the surface token               |
| `.nd-table--compact` | Reduces vertical cell padding                        |
| `data-selected`      | Highlights a selected row (use with `aria-selected`) |
| `data-numeric`       | Right-aligns and uses tabular numerals               |

## Accessibility

- Keep a `<caption>` or an `aria-label` on the table.
- Use `<th scope="col">` / `scope="row"`; never fake headers with `<td>`.
- The sort button must be operable by keyboard and update `aria-sort`.
- Add `aria-selected` alongside `data-selected` when rows are selectable.
- Do not remove focus outlines; the sort button has a token focus ring.

## Styling

Import `nd-table.css` after the tokens. Header, border, hover, selected, and
accent states use the semantic tokens; override the tokens rather than the
selectors.
