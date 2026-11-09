# nd-tooltip

> Hint surface built on the Zag.js tooltip machine.

`<nd-tooltip>` shows a short, non-interactive hint on hover or focus. The
machine handles the open/close delays and the `aria-describedby` link.

## Markup

```html
<nd-tooltip open-delay="200" close-delay="100">
    <button data-part="trigger">Info</button>
    <div data-part="positioner">
        <div data-part="content">The shortcut is Ctrl+K.</div>
    </div>
</nd-tooltip>
```

A missing trigger is created from `trigger-label` (or `More information`);
missing `content` and `positioner` wrappers are created on connect.

## Attributes

| Attribute       | Type      | Description                                    |
| :-------------- | :-------- | :--------------------------------------------- |
| `open`          | `boolean` | Initial open state; `onOpenChange` reflects it |
| `open-delay`    | `number`  | Milliseconds before opening                    |
| `close-delay`   | `number`  | Milliseconds before closing                    |
| `trigger-label` | `string`  | Label for the generated trigger                |

## Events

- `nd-open-change` — `detail: { open: boolean }`.

## Methods

- `show()` / `hide()` — drive the tooltip programmatically.

## Accessibility

The trigger is described by the tooltip while open, and the content is
`role="tooltip"`. Keep the hint short and non-interactive; use a popover when
the content needs links or buttons. The trigger must be focusable.

## Styling

Import `nd-tooltip.css` after the tokens. The surface inverts the text/background
tokens and the arrow follows it; both themes are covered automatically.
