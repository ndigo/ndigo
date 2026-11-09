# nd-tags-input

> Removable tag chips inside a text control, built on the Zag.js tags-input machine.

`<nd-tags-input>` turns typed entries into chips. Enter or the delimiter adds a
tag, the delete trigger removes one, and a hidden input carries the
comma-separated form value. Tags are editable by double-click or Enter on a
highlighted chip.

## Markup

```html
<nd-tags-input name="skills" value="design, system">
    <label data-part="label">Skills</label>
    <div data-part="control">
        <input data-part="input" placeholder="Add a skill" />
        <button data-part="clear-trigger" type="button">Clear</button>
    </div>
</nd-tags-input>
```

The element is the machine root. Items, previews, texts, delete triggers, and
the editable item inputs are generated from the machine value and inserted
before the authored input. A hidden input is created for the form value.

## Attributes

| Attribute       | Type      | Description                                           |
| :-------------- | :-------- | :---------------------------------------------------- |
| `value`         | `string`  | Initial tags, comma-separated                         |
| `name`          | `string`  | Form field name for the hidden value                  |
| `max`           | `number`  | Maximum number of tags                                |
| `delimiter`     | `string`  | Add/split character (default `,`)                     |
| `placeholder`   | `string`  | Input placeholder                                     |
| `add-on-paste`  | `boolean` | Split pasted text into tags                           |
| `blur-behavior` | `string`  | `add` commits the typed tag on blur; `clear` drops it |
| `disabled`      | `boolean` | Disable the control                                   |
| `readonly`      | `boolean` | Keep the value but block changes                      |
| `invalid`       | `boolean` | Mark the control invalid                              |
| `required`      | `boolean` | Mark the underlying input required                    |

## Events

- `nd-value-change` — `detail: { value: string[] }`. `data-value` mirrors the
  tags joined with `", "` (the same format as the hidden input).

## Methods

- `add(value)` — add one tag, subject to `max`.
- `removeTag(value)` — remove one tag by value.
- `clear()` — remove every tag.

## Keyboard and accessibility

The visible input is labelled by the authored label. Enter or the delimiter
adds the typed tag; Backspace at the start highlights and then deletes the last
chip; Left/Right move between chips; Delete removes the highlighted chip;
double-click or Enter on a highlighted chip edits it. The delete triggers carry
per-tag `aria-label`s, and the hidden input keeps the form value.

## Styling

Import `nd-tags-input.css` after the tokens. The control uses the surface and
border tokens with an accent focus ring; chips use accent-soft, and the invalid
state switches the control border to the danger token.
