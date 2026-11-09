# nd-navigation-menu

> Site navigation with dropdown content, built on the Zag.js navigation-menu machine.

`<nd-navigation-menu>` is the horizontal menu bar for a header: each item is a
trigger with a dropdown, or a plain link. Hover and click open the active item;
arrow keys, Escape, and outside interaction follow the machine.

## Markup

```html
<nd-navigation-menu aria-label="Main">
    <ul data-part="list">
        <li data-part="item" data-value="products">
            <button data-part="trigger" type="button">Products</button>
            <div data-part="content">
                <a data-part="link" href="/analytics">Analytics</a>
                <a data-part="link" href="/marketing" aria-current="page">Marketing</a>
            </div>
        </li>
        <li data-part="item" data-value="pricing">
            <a data-part="link" href="/pricing">Pricing</a>
        </li>
    </ul>
</nd-navigation-menu>
```

The element is the machine root: `data-part="root"`, `data-orientation`, and the
generated ids land on `<nd-navigation-menu>` itself. An item with a trigger and
content renders a dropdown; an item with only a link navigates directly. Mark
the current page with `aria-current="page"` or `data-current`.

## Attributes

| Attribute                     | Type      | Description                                   |
| :---------------------------- | :-------- | :-------------------------------------------- |
| `orientation`                 | `string`  | `horizontal` (default) or `vertical`          |
| `value`                       | `string`  | Initial open item value                       |
| `open-delay`                  | `number`  | Hover open delay in ms (default `200`)        |
| `close-delay`                 | `number`  | Hover close delay in ms (default `300`)       |
| `disable-hover-trigger`       | `boolean` | Open on click only                            |
| `disable-click-trigger`       | `boolean` | Open on hover only                            |
| `disable-pointer-leave-close` | `boolean` | Keep the content open when the pointer leaves |

## Events

- `nd-value-change` — `detail: { value: string }`; the empty string means all
  dropdowns are closed. `data-value` on the element mirrors it.

## Methods

- `show(value)` — open one item's dropdown.
- `hide()` — close any open dropdown.

## Keyboard and accessibility

The list is a set of native links and buttons, so it stays keyboard reachable
without the machine. The trigger carries `aria-expanded`/`aria-controls`; content
is labelled by its trigger. Left/Right (horizontal) or Up/Down (vertical) move
between items, Home/End jump to the edges, Enter/Space opens a trigger, Escape
closes the content, and Tab moves through the open links.

## Styling

Import `nd-navigation-menu.css` after the tokens. Triggers and links use the
text/muted/accent-soft tokens; content uses the raised surface, border, radius,
and shadow. The horizontal dropdown opens below its item; vertical content opens
to the side. Override the tokens rather than the selectors.
