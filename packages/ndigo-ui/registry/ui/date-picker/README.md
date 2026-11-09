# nd-date-picker

> Popup calendar built on the Zag.js date-picker machine.

`<nd-date-picker>` keeps the input, trigger, and chrome as authored markup and
generates the calendar grid from the machine's weeks. The visible input shows
the localized date; a hidden input submits the ISO value.

## Markup

```html
<nd-date-picker name="start" value="2026-11-09">
    <label data-part="label">Start date</label>
    <div data-part="control">
        <input data-part="input" placeholder="Pick a date" />
        <button data-part="trigger" type="button" aria-label="Open calendar">v</button>
        <button data-part="clear-trigger" type="button">Clear</button>
    </div>
    <div data-part="positioner">
        <div data-part="content">
            <div data-part="view-control">
                <button data-part="prev-trigger" type="button">‹</button>
                <span data-part="view-label"></span>
                <button data-part="next-trigger" type="button">›</button>
            </div>
        </div>
    </div>
</nd-date-picker>
```

A root wrapper, the table (`table` → `table-head`/`table-body`), and the hidden
input are created on connect. The header row and week rows are rebuilt from the
machine on every render, so the grid is never stale.

## Attributes

| Attribute  | Type      | Description                                                   |
| :--------- | :-------- | :------------------------------------------------------------ |
| `value`    | `string`  | Initial ISO date (`YYYY-MM-DD`)                               |
| `name`     | `string`  | Form field name for the hidden ISO input                      |
| `min`      | `string`  | Earliest selectable ISO date                                  |
| `max`      | `string`  | Latest selectable ISO date                                    |
| `locale`   | `string`  | BCP 47 locale for the input and month label (default `en-US`) |
| `open`     | `boolean` | Controlled open state; reflected by the element               |
| `disabled` | `boolean` | Disable the picker                                            |
| `readonly` | `boolean` | Keep the value but block changes                              |
| `required` | `boolean` | Mark the input required                                       |
| `invalid`  | `boolean` | Mark the input invalid                                        |

## Events

- `nd-value-change` — `detail: { value: DateValue[], valueAsString: string[], view }`.
  `valueAsString` is the ISO representation (`YYYY-MM-DD`).
- `nd-open-change` — `detail: { open: boolean, value: DateValue[] }`.

## Methods

- `show()` / `hide()` — open or close the calendar programmatically.
- `clear()` — clear the selected date.
- `select(iso)` — select one ISO date programmatically.

## Keyboard and accessibility

The input is labelled by the visible label; the trigger has `aria-haspopup="grid"`
and `aria-expanded`. The content is an application region containing a grid
named by the visible month. Arrow keys move the focused day, PageUp/PageDown
change month, Home/End move within the week, Enter selects, and Escape closes.
Each day button carries a full localized `aria-label`; today, selected, and
unavailable states are exposed as data attributes.

## Styling

Import `nd-date-picker.css` after the tokens. The popup uses the raised surface
and shadow; selected days use the accent tokens, today a 1px accent inset ring,
and unavailable days a line-through.
