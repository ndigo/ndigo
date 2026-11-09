# nd-combobox

> Filterable single-select built on the Zag.js combobox machine.

`<nd-combobox>` filters the authored items as you type, keeps keyboard
navigation on the visible collection, and syncs the selected label back into
the input.

## Markup

```html
<nd-combobox name="fruit">
    <label data-part="label">Fruit</label>
    <div data-part="control">
        <input data-part="input" placeholder="Search fruit" />
        <button data-part="trigger" type="button">v</button>
        <button data-part="clear-trigger" type="button">Clear</button>
    </div>
    <div data-part="positioner">
        <div data-part="content">
            <div data-part="item" data-value="apple">
                <span data-part="item-text">Apple</span><span data-part="item-indicator">✓</span>
            </div>
            <div data-part="item" data-value="banana">
                <span data-part="item-text">Banana</span><span data-part="item-indicator">✓</span>
            </div>
        </div>
    </div>
</nd-combobox>
```

A root wrapper is created on connect. Non-matching items are hidden as you
type; clearing the input restores them.

## Attributes

| Attribute  | Type      | Description                                    |
| :--------- | :-------- | :--------------------------------------------- |
| `name`     | `string`  | Form field name                                |
| `value`    | `string`  | Initial input value                            |
| `disabled` | `boolean` | Disable the combobox                           |
| `readonly` | `boolean` | Keep the value but block changes               |
| `required` | `boolean` | Mark the input required                        |
| `invalid`  | `boolean` | Mark the input invalid                         |
| `open`     | `boolean` | Initial open state; `onOpenChange` reflects it |
| `inline`   | `boolean` | Keep the list in normal flow (no positioning)  |

## Events

- `nd-value-change` — `detail: { value: string[] }`; `data-value` mirrors the
  joined values.
- `nd-open-change` — `detail: { open: boolean }`.

## Methods

- `show()` / `hide()` — open or close the listbox programmatically.
- `clear()` — reset the selected value and the query.
- `select(value)` — select one value programmatically.

## Keyboard and accessibility

The input is `role="combobox"` with `aria-expanded`/`aria-controls`; the content
is a listbox and items are options. Arrow keys move through the filtered items,
Enter selects, Escape closes, and the clear trigger resets the value.

## Styling

Import `nd-combobox.css` after the tokens. The input uses the surface/border
tokens, the content the raised surface and shadow, and highlighted/selected
items the accent tokens.
