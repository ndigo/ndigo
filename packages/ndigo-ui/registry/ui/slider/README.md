# nd-slider

> Single-value range built on the Zag.js slider machine.

`<nd-slider>` provides the track/range/thumb anatomy, pointer dragging,
keyboard steps, and the slider ARIA contract.

## Markup

```html
<nd-slider value="40" min="0" max="100" step="1">
    <label data-part="label">Volume</label>
    <div data-part="control">
        <div data-part="track"><div data-part="range"></div></div>
        <div data-part="thumb"></div>
    </div>
</nd-slider>
```

A root wrapper is created when absent. Include a `[data-part="label"]` or pass
`aria-label`/`aria-labelledby` so the thumb has an accessible name.

## Attributes

| Attribute | Type     | Description                                    |
| :-------- | :------- | :--------------------------------------------- |
| `value`   | `number` | Initial value (also settable via `setValue()`) |
| `min`     | `number` | Minimum (default `0`)                          |
| `max`     | `number` | Maximum (default `100`)                        |
| `step`    | `number` | Step (default `1`)                             |
| `name`    | `string` | Form field name for the underlying input       |

## Events

- `nd-value-change` — `detail: { value: number[] }`; the element also mirrors
  the first value into `data-value`.

## Methods

- `setValue(value)` — set the slider value programmatically.

## Keyboard and accessibility

The thumb is `role="slider"` with `aria-valuemin`/`max`/`now`. Arrow keys step,
Home/End jump to the bounds, and PageUp/PageDown use the large step. Dragging
works with pointer events; the thumb shows the shared focus ring.

## Styling

Import `nd-slider.css` after the tokens. The track uses the border token, the
range the accent token, and the thumb the raised surface plus the accent border.
