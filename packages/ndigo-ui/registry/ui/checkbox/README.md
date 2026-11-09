# nd-checkbox

> Native checkboxes and radio buttons with the brand accent.

`nd-checkbox.css` styles the platform controls with `accent-color`, focus, and
disabled states, plus a row helper and a fieldset helper for groups.

## Usage

```html
<label class="nd-choice">
    <input class="nd-checkbox" type="checkbox" name="updates" checked />
    <span class="nd-label">Product updates</span>
</label>

<fieldset class="nd-choice-group">
    <legend class="nd-label">Plan</legend>
    <label class="nd-choice">
        <input class="nd-radio" type="radio" name="plan" value="free" checked />
        <span class="nd-label">Free</span>
    </label>
    <label class="nd-choice">
        <input class="nd-radio" type="radio" name="plan" value="pro" />
        <span class="nd-label">Pro</span>
    </label>
</fieldset>
```

## Classes

| Class              | Purpose                                          |
| :----------------- | :----------------------------------------------- |
| `.nd-checkbox`     | Native `<input type="checkbox">`                 |
| `.nd-radio`        | Native `<input type="radio">`                    |
| `.nd-choice`       | Label row that aligns one control with its label |
| `.nd-choice-group` | Fieldset layout for a radio or checkbox group    |

## Accessibility

Wrap each control in a `<label>` (or use `for`/`id`) so the control has an
accessible name. Group related radios in a `<fieldset>` with a `<legend>`.
Keep the native control; do not replace it with a styled span.
