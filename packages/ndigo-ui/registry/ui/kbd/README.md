# nd-kbd

> Key caps and keyboard chords.

## Usage

```html
<p>Press <kbd class="nd-kbd">Ctrl</kbd> + <kbd class="nd-kbd">K</kbd> to search.</p>

<span class="nd-kbd-group">
    <kbd class="nd-kbd">⌘</kbd>
    <kbd class="nd-kbd">K</kbd>
</span>
```

## Accessibility

`<kbd>` is the native element for user input; keep it. Do not use the key cap as
a button or shortcut handler — pair it with the real control. The visual spacing
in a chord is decorative; the surrounding sentence should explain the shortcut.

## Styling

Import `nd-kbd.css` after the tokens. The cap uses the raised surface, border, and
monospace font; the bottom border is thicker to read as a physical key.
