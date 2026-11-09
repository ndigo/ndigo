# nd-spinner

> Rotating loading indicator for short waits.

The spinner is markup plus CSS, sized in `em` and colored with `currentColor` so
it inherits the surrounding text.

## Usage

```html
<span class="nd-spinner" role="status" aria-label="Loading"></span>
<span class="nd-spinner" data-size="sm" role="status" aria-label="Saving"></span>
<span class="nd-spinner" data-size="lg" role="status" aria-label="Loading results"></span>
```

Pair it with a visible label when the wait is long enough to explain:

```html
<p class="nd-row" role="status">
    <span class="nd-spinner" data-size="sm" aria-hidden="true"></span>
    Loading invoices…
</p>
```

## Sizes

| `data-size` | Size    |
| :---------- | :------ |
| `sm`        | 1rem    |
| default     | 1.25rem |
| `lg`        | 2rem    |

## Accessibility

Give the spinner `role="status"` and an accessible name (`aria-label`, or a
visible sibling text inside a live region). Do not put interactive content inside
the spinner. When reduced motion is requested the rotation slows rather than
stops, so the control still reads as busy.

## Styling

Import `nd-spinner.css` after the tokens. The ring uses `currentColor` at low
opacity with a solid top segment; override `color` to theme it.
