# nd-select

> Single-select dropdown built on the Zag.js select machine.

`<nd-select>` derives its collection from the authored items and keeps a hidden
native `<select>` in sync, so the value submits with the form.

## Markup

```html
<nd-select name="fruit" value="apple">
    <label data-part="label">Fruit</label>
    <div data-part="control">
        <button data-part="trigger" type="button">
            <span data-part="value-text"></span>
            <span data-part="indicator">v</span>
        </button>
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
</nd-select>
```

A root wrapper, hidden `<select>`, and placeholder value text are created on
connect. Items live directly inside the content listbox.

## Attributes

| Attribute     | Type      | Description                                     |
| :------------ | :-------- | :---------------------------------------------- |
| `value`       | `string`  | Initial selected value                          |
| `name`        | `string`  | Form field name for the hidden select           |
| `placeholder` | `string`  | Value text when nothing is selected             |
| `disabled`    | `boolean` | Disable the select                              |
| `readonly`    | `boolean` | Keep the value but block changes                |
| `required`    | `boolean` | Mark the hidden select required                 |
| `invalid`     | `boolean` | Mark the select invalid                         |
| `open`        | `boolean` | Controlled open state; reflected by the element |

## Events

- `nd-value-change` — `detail: { value: string[] }`; `data-value` mirrors the
  joined values.
- `nd-open-change` — `detail: { open: boolean }`.

## Methods

- `select(value)` — select one value programmatically.

## Keyboard and accessibility

The trigger is a combobox with `aria-expanded`/`aria-controls`; the content is a
listbox and items are options. Arrow keys move the highlight, Enter selects, and
Escape closes. The hidden native select carries the form value and is labelled
by the visible label.

## Styling

Import `nd-select.css` after the tokens. The trigger uses the surface/border
tokens, the content the raised surface and shadow, and the selected item the
accent tokens.
