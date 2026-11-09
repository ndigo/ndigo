# nd-drawer

> Edge-anchored dialog built on the Zag.js dialog machine.

`<nd-drawer>` has the same parts and behaviour as `nd-dialog` — focus trap,
Escape/outside dismissal, focus restore — with an edge placement instead of a
centered surface.

## Markup

```html
<nd-drawer placement="end">
    <button data-part="trigger">Open drawer</button>
    <div data-part="content">
        <h2 data-part="title">Filters</h2>
        <p data-part="description">Narrow the list.</p>
        <button data-part="close-trigger">Close</button>
        <p>Your content goes here.</p>
    </div>
</nd-drawer>
```

A missing trigger, backdrop, positioner, and content wrapper are created on
connect, just like the dialog.

## Attributes

| Attribute       | Type      | Description                                                                     |
| :-------------- | :-------- | :------------------------------------------------------------------------------ |
| `placement`     | `string`  | `end` (default), `start`, `bottom`, or `top`; invalid values fall back to `end` |
| `open`          | `boolean` | Controlled open state; reflected by the element                                 |
| `trigger-label` | `string`  | Label for the generated trigger                                                 |

## Events

- `nd-open-change` — `detail: { open: boolean }`.

## Methods

- `show()` / `hide()` — open or close programmatically.

## Accessibility

The dialog machine owns the focus trap, initial focus, focus restore, Escape,
outside-click dismissal, scroll lock, and `aria-modal`/labelledby/describedby.
Provide a title or an `aria-label`. The edge placement is presentational only;
keyboard behaviour is identical to the dialog.

## Styling

Import `nd-drawer.css` after the tokens. `data-placement` selects the flex
alignment and panel sizing: side drawers fill the block size, bottom/top drawers
cap at `80dvh`. The backdrop uses the background token through `color-mix`.
