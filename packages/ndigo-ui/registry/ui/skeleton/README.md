# nd-skeleton

> Loading placeholder for text, avatars, and blocks.

Skeletons are markup plus CSS. They mirror the shape of the content that is
loading so the page does not jump when it arrives.

## Usage

```html
<div aria-hidden="true">
    <span class="nd-skeleton" data-shape="text" style="inline-size: 60%"></span>
    <span class="nd-skeleton" data-shape="text" style="inline-size: 40%"></span>
    <span class="nd-skeleton" data-shape="circle"></span>
    <span class="nd-skeleton" data-shape="rect"></span>
</div>
```

Set widths inline or with a local class; the shapes provide the height and
radius.

## Shapes

| `data-shape`     | Size                       |
| :--------------- | :------------------------- |
| `text` (default) | One line tall, pill radius |
| `circle`         | 2.5rem square, fully round |
| `rect`           | 6rem tall block            |

## Accessibility

The skeleton is decorative. Wrap it in `aria-hidden="true"` and announce the
loading state separately, for example with a `<p role="status">Loading…</p>` or
an `aria-busy="true"` region. The shimmer is disabled when the visitor prefers
reduced motion.

## Styling

Import `nd-skeleton.css` after the tokens. The base uses the raised surface; the
shimmer overlays a low-opacity text gradient.
