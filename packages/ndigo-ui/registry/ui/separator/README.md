# nd-separator

> Horizontal or vertical rule for grouping content.

The separator is markup plus CSS, with no runtime.

## Usage

```html
<hr class="nd-separator" />

<div class="nd-row">
    <span>Left</span>
    <div class="nd-separator" data-orientation="vertical" role="separator" aria-orientation="vertical"></div>
    <span>Right</span>
</div>
```

Use `<hr>` for a thematic break between sections; it already carries the
separator role. Use a `<div role="separator">` only when a visual rule is needed
inside a layout and no thematic break is implied.

## Accessibility

- `<hr>` is announced as a separator without extra attributes.
- A decorative `<div>` should either be `aria-hidden="true"` or carry
  `role="separator"`, depending on whether the division matters to the content.
- Set `aria-orientation="vertical"` on vertical separators; horizontal is the
  default.

## Styling

Import `nd-separator.css` after the tokens. The horizontal rule uses the border
token and block margins; the vertical variant stretches to the flex/grid line and
uses inline margins.
