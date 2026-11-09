# nd-alert

> Inline status message with info, success, warning, and danger variants.

The alert is markup plus CSS. It uses a tinted surface derived from the semantic
color tokens and an accent edge, so it reads as a message without shouting.

## Usage

```html
<div class="nd-alert" data-variant="success" role="status">
    <span class="nd-alert__icon" aria-hidden="true">✓</span>
    <div class="nd-alert__content">
        <p class="nd-alert__title">Saved</p>
        <p class="nd-alert__description">The invoice was updated.</p>
    </div>
</div>
```

The icon and title are optional; the content column can hold any short markup.

## Variants

| `data-variant`   | Color token          |
| :--------------- | :------------------- |
| `info` (default) | `--nd-color-info`    |
| `success`        | `--nd-color-success` |
| `warning`        | `--nd-color-warning` |
| `danger`         | `--nd-color-danger`  |

## Accessibility

Use `role="status"` for a non-urgent update and `role="alert"` only for
something that needs immediate attention. Keep the text specific; the color is
reinforcement, not the message. Icons are `aria-hidden` because the text carries
the meaning.

## Styling

Import `nd-alert.css` after the tokens. Override `--nd-alert-color` or the
semantic tokens rather than the selectors.
