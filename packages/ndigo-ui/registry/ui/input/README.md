# nd-input

> Native text controls: single-line inputs and multi-line textareas on the design tokens.

The platform supplies the control; this item supplies the surface. No custom
element, no runtime, and no hidden value model.

## Usage

```html
<label class="nd-label" for="name">Name</label>
<input class="nd-input" id="name" name="name" autocomplete="name" />

<label class="nd-label" for="notes">Notes</label>
<textarea class="nd-textarea" id="notes" name="notes"></textarea>
```

## States

- `:hover` and `:focus-visible` use the accent border and the shared focus ring.
- `disabled` fades the control and blocks the pointer.
- `aria-invalid="true"` switches the border (and the focus ring) to the danger token.

## Accessibility

Always pair the control with a `<label for>`. Use `aria-describedby` for help or
error text and `aria-invalid="true"` for the invalid state; the field item
styles the surrounding text. Do not replace the native control.

## Styling

Every value comes from a `--nd-*` token. The control is full-width by default;
constrain it with the container rather than overriding `inline-size`.
