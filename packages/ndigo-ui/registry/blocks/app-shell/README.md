# nd-app-shell

> Responsive application frame: skip link, banner, primary navigation, sidebar, main landmark, footer.

The shell is markup plus CSS, not a custom element. It server-renders in
Astro, EJS, and Ndigo islands, and it composes the items it contains — the
brand mark uses `.nd-mark`, the actions use `.nd-button`.

## Usage

Copy `app-shell.html` into the layout and replace the `<main>` contents. Keep
the shell's structure: the skip link is the first focusable element, `<main>`
is unique, and the two navigation landmarks carry distinct labels.

```html
<div class="nd-app-shell">
    <a class="nd-skip-link" href="#nd-main">Skip to content</a>
    <header class="nd-app-shell__banner">…</header>
    <div class="nd-app-shell__body">
        <aside class="nd-app-shell__sidebar" aria-label="Section navigation">…</aside>
        <main id="nd-main" class="nd-app-shell__main" tabindex="-1">…</main>
    </div>
    <footer class="nd-app-shell__footer">…</footer>
</div>
```

Import `app-shell.css` after the tokens and the button stylesheet. The shell
uses small-screen breakpoints at `48rem`; override the tokens rather than the
layout selectors where possible.

## Landmarks

| Element                      | Purpose                                      |
| :--------------------------- | :------------------------------------------- |
| `.nd-skip-link`              | First focusable element; jumps to `#nd-main` |
| `<header>`                   | Banner with the brand and primary navigation |
| `<nav aria-label="Primary">` | Top-level navigation                         |
| `<aside aria-label="…">`     | Section navigation (sidebar)                 |
| `<main id="nd-main">`        | Unique main landmark; receives skip focus    |
| `<footer>`                   | Page footer                                  |

Use `aria-current="page"` on the active link in both navigations.

## Accessibility

- Keep one `<main>` and one `<header>` per page.
- Keep both navigation landmarks labelled and distinct.
- Keep `tabindex="-1"` on `<main>` so the skip link moves focus, not just scroll.
- The sidebar becomes a horizontal scroller below `48rem`; it stays keyboard reachable.

## Styling

Every value comes from a `--nd-*` token. The shell has no runtime and no
dependencies beyond the `theme` and `button` items.
