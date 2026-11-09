# nd-file-upload

> Dropzone and accepted-file list built on the Zag.js file-upload machine.

`<nd-file-upload>` opens the browser picker from the dropzone or trigger button,
accepts drops, validates files, and lists them with remove and clear actions.
The hidden file input carries the form data.

## Markup

```html
<nd-file-upload name="attachments" accept="image/*,.pdf" max-files="3">
    <label data-part="label">Attachments</label>
    <div data-part="dropzone">Drop files here or use the button below.</div>
    <button data-part="trigger" type="button">Choose files</button>
    <button data-part="clear-trigger" type="button">Clear</button>
</nd-file-upload>
```

The element is the machine root and creates the hidden file input and the
`item-group` list. The dropzone is the clickable/drop surface; keep the trigger
separate so the dropzone does not nest a button inside its `role="button"`.

## Attributes

| Attribute       | Type      | Description                           |
| :-------------- | :-------- | :------------------------------------ |
| `name`          | `string`  | Form field name for the file input    |
| `accept`        | `string`  | Comma-separated MIME types/extensions |
| `max-files`     | `number`  | Maximum number of files (default `1`) |
| `max-file-size` | `number`  | Maximum size per file in bytes        |
| `min-file-size` | `number`  | Minimum size per file in bytes        |
| `disabled`      | `boolean` | Disable the control                   |
| `readonly`      | `boolean` | Keep the value but block changes      |
| `required`      | `boolean` | Mark the file input required          |
| `invalid`       | `boolean` | Mark the control invalid              |

`max-files` above `1` sets `multiple` on the input.

## Events

- `nd-file-change` — `detail: { acceptedFiles: File[], rejectedFiles: { file, errors }[] }`.
  `data-value` lists accepted file names joined with `", "`, and `data-count`
  holds the accepted count.

## Methods

- `openFilePicker()` — open the browser picker.
- `clear()` — remove every accepted file.

## Accessibility

The dropzone is a labelled `role="button"` and responds to Enter/Space; the
trigger is a native button. The hidden file input is taken out of the tab order
and the accessibility tree because the dropzone/trigger provide the interface.
Each item's remove button is labelled per file. Rejected files are reported
through the event rather than rendered, so the accepted list stays unambiguous.

## Styling

Import `nd-file-upload.css` after the tokens. The dropzone is a dashed surface
that switches to the accent tokens on hover, focus, and drag; items are compact
surface rows with a muted size label.
