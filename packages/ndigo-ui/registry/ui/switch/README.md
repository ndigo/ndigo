# nd-switch

> Accessible toggle built on the Zag.js switch machine.

`<nd-switch>` renders a labelled switch backed by a visually hidden checkbox,
so the native form value and the ARIA switch contract stay intact. The element
builds the label, input, control, thumb, and label span when the markup is just
text.

## Usage

```html
<nd-switch checked>Notifications</nd-switch>
```

Authored parts also work:

```html
<nd-switch>
    <label data-part="root">
        <input data-part="hidden-input" />
        <span data-part="control"><span data-part="thumb"></span></span>
        <span data-part="label">Notifications</span>
    </label>
</nd-switch>
```

## Attributes

| Attribute  | Type      | Description                                        |
| :--------- | :-------- | :------------------------------------------------- |
| `checked`  | `boolean` | Controlled checked state; reflected by the element |
| `disabled` | `boolean` | Disable the switch                                 |
| `readonly` | `boolean` | Keep the value but block changes                   |
| `required` | `boolean` | Mark the hidden checkbox required                  |
| `invalid`  | `boolean` | Mark the hidden checkbox invalid                   |
| `name`     | `string`  | Form field name                                    |
| `label`    | `string`  | Label text used when no label content is authored  |

## Events

- `nd-checked-change` — `detail: { checked: boolean }`.

## Accessibility

The label wraps the hidden checkbox and names it; the visible control is
`aria-hidden`, and the checkbox carries the switch semantics. Space toggles
when the checkbox has focus. Disabled switches block pointer and keyboard
changes.

## Styling

Import `nd-switch.css` after the tokens. The track uses the surface/accent
tokens, the thumb translates on `data-state="checked"`, and the focus ring uses
the shared focus tokens.
