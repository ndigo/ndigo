# nd-accordion

> Disclosure stack built on the Zag.js accordion machine.

`<nd-accordion>` manages one or more expandable items with the ARIA expanded/
controls contract and arrow-key focus movement.

## Markup

```html
<nd-accordion collapsible>
    <div data-part="item" data-value="shipping">
        <button data-part="item-trigger" data-value="shipping">
            Shipping <span data-part="item-indicator">+</span>
        </button>
        <div data-part="item-content" data-value="shipping">Ships in two days.</div>
    </div>
    <div data-part="item" data-value="returns">
        <button data-part="item-trigger" data-value="returns">Returns <span data-part="item-indicator">+</span></button>
        <div data-part="item-content" data-value="returns">Thirty-day returns.</div>
    </div>
</nd-accordion>
```

A root wrapper is created when absent. Each item, trigger, content, and
indicator carry the same `data-value`.

## Attributes

| Attribute     | Type      | Description                          |
| :------------ | :-------- | :----------------------------------- |
| `value`       | `string`  | Initial open values, comma-separated |
| `multiple`    | `boolean` | Allow more than one open item        |
| `collapsible` | `boolean` | Allow the open item to close again   |

## Events

- `nd-value-change` — `detail: { value: string[] }`.

## Methods

- `toggle(value)` — open or close one item by value.

## Keyboard and accessibility

Triggers are buttons with `aria-expanded`/`aria-controls`; content regions are
`role="region"` labelled by their trigger. Arrow keys move focus between
triggers; Home/End jump to the edges. The indicator rotates when open.

## Styling

Import `nd-accordion.css` after the tokens. Items use hairline borders, the
trigger uses the text tokens, and the indicator transition honours reduced
motion.
