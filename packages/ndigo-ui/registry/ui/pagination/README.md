# nd-pagination

> Native page navigation with links, a current-page state, and disabled edges.

Pagination is markup plus CSS, not a custom element. It server-renders in
Astro, EJS, and Ndigo islands, and page links stay real `<a href>` elements so
middle-click, copy-link, and browser history work.

## Usage

```html
<nav class="nd-pagination" aria-label="Pagination">
    <ul class="nd-pagination__list">
        <li>
            <span class="nd-pagination__link" data-direction="previous" aria-disabled="true">‹ Previous</span>
        </li>
        <li><a class="nd-pagination__link" href="?page=1">1</a></li>
        <li><span class="nd-pagination__link" aria-current="page">2</span></li>
        <li><a class="nd-pagination__link" href="?page=3">3</a></li>
        <li><span class="nd-pagination__ellipsis" aria-hidden="true">…</span></li>
        <li><a class="nd-pagination__link" href="?page=8">8</a></li>
        <li><a class="nd-pagination__link" data-direction="next" href="?page=3">Next ›</a></li>
    </ul>
</nav>
```

Render only the pages your window contains; the ellipsis stands in for the
skipped range. Give every pagination on a page a distinct `aria-label`
(`"Search results pages"`, `"Order history pages"`).

## States

| State            | Markup                                                                        |
| :--------------- | :---------------------------------------------------------------------------- |
| Current page     | `<span class="nd-pagination__link" aria-current="page">2</span>`              |
| Unavailable edge | `<span class="nd-pagination__link" aria-disabled="true">…</span>` — no `href` |
| Skipped range    | `<span class="nd-pagination__ellipsis" aria-hidden="true">…</span>`           |

Use `<a href>` for every page a visitor can navigate to. Do not attach
JavaScript click handlers to dead links.

## Accessibility

- Keep the `<nav>` landmark labelled; multiple paginations need distinct names.
- Mark exactly one item `aria-current="page"`.
- The current page and unavailable edges are `<span>`s, not links, so they are
  not focus stops.
- Keep the previous/next text visible; the arrows alone are ambiguous.
- The ellipsis is `aria-hidden` because the surrounding links already convey
  the page range.

## Styling

Import `nd-pagination.css` after the tokens. Page links use the surface,
border, and accent tokens; the current page uses `--nd-color-accent` with
`--nd-color-on-accent`. Override the tokens rather than the selectors.
