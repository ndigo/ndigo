# nd-button

> Native-first button styles: the platform supplies the behaviour, the design system supplies the look.

`nd-button.css` styles the native `<button>` (and, for navigation, `<a href>`)
with variants and sizes. There is no custom element and no JavaScript: form
participation, disabled semantics, keyboard activation, and accessible names
all come from the platform.

## Usage

```html
<button class="nd-button" data-variant="primary">Save</button>
<button class="nd-button">Cancel</button>
<button class="nd-button" data-variant="ghost" data-size="sm">Skip</button>
<button class="nd-button" data-variant="danger">Delete</button>
```

Use `<button type="submit">` inside a form for submission. Use `<a class="nd-button" href="...">`
only for navigation; a link is not a button.

## Variants

| `data-variant` | Use                                                   |
| :------------- | :---------------------------------------------------- |
| `primary`      | The main action in a view                             |
| `secondary`    | Default; neutral actions (also the no-attribute case) |
| `ghost`        | Low-emphasis actions in dense surfaces                |
| `danger`       | Destructive actions, rendered as an outline           |

## Sizes

| `data-size` | Height | Use                           |
| :---------- | :----- | :---------------------------- |
| `sm`        | 2rem   | Dense toolbars and table rows |
| `md`        | 2.5rem | Default; no attribute needed  |
| `lg`        | 3rem   | Page-level calls to action    |

## States

- `disabled` on `<button>` — native disabled semantics.
- `aria-disabled="true"` — for link-styled buttons that must stay focusable;
  pair it with removing `href` and suppressing the click handler.
- `:focus-visible` uses the shared `--nd-focus-ring-*` tokens.

## Accessibility

Keep the accessible name in the button's text. Icon-only buttons must carry an
`aria-label`. The styles never replace the native element, so screen-reader and
keyboard behaviour is unchanged. The danger variant is an outline rather than a
solid fill so the label keeps its contrast in both themes.

## Styling

Every value comes from a `--nd-*` token. Override the tokens or the
`--nd-button-*` locals; do not fork the selectors.
