# nd-badge

> Compact status label for counts, states, and categories.

Badges are inline markup plus CSS. Keep them short — a word or two, or a number.

## Usage

```html
<span class="nd-badge">Draft</span>
<span class="nd-badge" data-variant="accent">New</span>
<span class="nd-badge" data-variant="success">Paid</span>
<span class="nd-badge" data-variant="warning">Pending</span>
<span class="nd-badge" data-variant="danger">Overdue</span>
```

## Variants

| `data-variant`    | Appearance                           |
| :---------------- | :----------------------------------- |
| neutral (default) | Surface with a border                |
| `accent`          | Solid accent with on-accent text     |
| `success`         | Tinted success background and border |
| `warning`         | Tinted warning background and border |
| `danger`          | Tinted danger background and border  |
| `info`            | Tinted info background and border    |

## Accessibility

Badges are text, so they are read in order. Do not use color alone to convey a
state; the label must say it. If a badge is purely decorative, hide it with
`aria-hidden="true"`.

## Styling

Import `nd-badge.css` after the tokens. The neutral badge uses the raised surface
and border tokens; the variants use the semantic colors mixed with the surface.
