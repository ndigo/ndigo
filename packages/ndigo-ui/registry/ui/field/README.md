# nd-field

> Label, help, and error scaffolding for native form controls.

`nd-field` is layout and typography around a real control from the `input` or
`checkbox` items. It does not create, wrap, or replace the control.

## Usage

```html
<div class="nd-field">
    <label class="nd-label" for="email" data-required>Email</label>
    <input
        class="nd-input"
        id="email"
        name="email"
        type="email"
        aria-describedby="email-help email-error"
        aria-invalid="true"
    />
    <p class="nd-help" id="email-help">We only use this for account notices.</p>
    <p class="nd-error" id="email-error">Enter a valid email address.</p>
</div>
```

## Parts

| Class       | Purpose                                                   |
| :---------- | :-------------------------------------------------------- |
| `.nd-field` | Vertical layout with the shared gap                       |
| `.nd-label` | Label; `data-required` appends a danger-coloured asterisk |
| `.nd-help`  | Muted supporting text                                     |
| `.nd-error` | Danger text for the validation message                    |

The field marks its label with the danger token while a descendant carries
`aria-invalid="true"`.

## Accessibility

Keep the label's `for` pointed at the control's `id`. Reference help and error
text with `aria-describedby`; use `aria-invalid` for the state, not a CSS class.
The required marker is visual only — keep the native `required` attribute.
