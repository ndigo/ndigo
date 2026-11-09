# nd-popover

> Non-modal overlay built on the Zag.js popover machine.

`<nd-popover>` wraps a trigger and a positioned surface with focus handling,
outside-click dismissal, and Escape. It is not modal; the rest of the page
stays interactive.

## Markup

```html
<nd-popover>
    <button data-part="trigger">Open settings</button>
    <div data-part="positioner">
        <div data-part="content">
            <h2 data-part="title">Settings</h2>
            <p data-part="description">Adjust the workspace.</p>
            <button data-part="close-trigger">Close</button>
        </div>
    </div>
</nd-popover>
```

A missing trigger is created from `trigger-label` (or `Open popover`); missing
`content` and `positioner` wrappers are created on connect.

## Attributes

| Attribute       | Type      | Description                                     |
| :-------------- | :-------- | :---------------------------------------------- |
| `open`          | `boolean` | Controlled open state; reflected by the element |
| `trigger-label` | `string`  | Label for the generated trigger                 |

## Events

- `nd-open-change` — `detail: { open: boolean }`.

## Methods

- `show()` / `hide()` — open or close programmatically.

## Keyboard and accessibility

Escape closes and restores focus; clicking outside dismisses. The trigger
carries `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`; the
content is a labelled `role="dialog"`. Keep a title or an `aria-label`.

## Styling

Import `nd-popover.css` after the tokens. The surface uses the raised surface,
border, radius, and shadow tokens; the arrow is optional.
