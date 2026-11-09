# nd-command

> Command palette block: a listbox inside a modal dialog, opened with Cmd/Ctrl+K.

The block is a composition, not a new machine. `nd-dialog` supplies the modal,
focus trap, and dismissal; `nd-combobox` supplies filtering, highlight, and
selection; `command.ts` adds the shortcut and the `nd-command` event.

## Usage

Copy the block next to the `theme`, `button`, `dialog`, and `combobox` items.
Import the element modules, then initialize the palette:

```ts
import './ui/nd-dialog/nd-dialog';
import './ui/nd-combobox/nd-combobox';
import { initCommandPalette } from './components/command/command';

const palette = initCommandPalette(document);
```

`initCommandPalette(document)` finds `[data-command]` in the given root and
returns `{ open, close, destroy }`, or `null` when the markup is absent.

```html
<div class="nd-command" data-command>
    <nd-dialog initial-focus="[data-part='input']">…</nd-dialog>
</div>
```

Replace the `[data-part="item"]` rows with your commands. Keep `data-value`
unique; the visible `[data-part="item-text"]` becomes the event label.

## Behaviour

- **Cmd/Ctrl+K** opens the dialog and the listbox; pressing it again refocuses
  the input.
- Typing filters the items through the combobox; the empty state appears when
  nothing matches.
- Arrow keys move the highlight, Enter selects, Escape closes the dialog or the
  listbox (the combobox consumes the first Escape).
- Selecting a command closes the palette, clears the query, and emits
  `nd-command` from the block root.
- Closing the dialog by any path also clears the query, so reopening starts from
  the full list.

## Events

- `nd-command` — `detail: { value: string, label: string }`, emitted from the
  `[data-command]` container after a selection.

## Accessibility

The dialog carries `aria-modal`, a labelled title, and a described description.
The combobox input is the dialog's `initial-focus` target and exposes
`role="combobox"` with `aria-expanded`/`aria-controls`; the list is a listbox of
options. The Cmd/Ctrl+K shortcut does not replace the visible trigger, so the
palette stays keyboard reachable without a modifier.

## Styling

Import `command.css` after the dialog, combobox, and button stylesheets. The
block overrides the dialog surface to be wider and padding-free, makes the
combobox list inline (`inline` on `<nd-combobox>`), and uses the token surfaces
for the trigger and the highlight.
