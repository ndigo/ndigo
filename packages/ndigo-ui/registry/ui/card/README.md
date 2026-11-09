# nd-card

> Content surface with header, media, content, and footer parts.

The card is markup plus CSS. It provides the surface, spacing, and responsive
media handling; the contents and heading level stay yours.

## Usage

```html
<article class="nd-card">
    <img class="nd-card__media" src="/cover.jpg" alt="" />
    <div class="nd-card__header">
        <h2 class="nd-card__title">Quarterly report</h2>
        <p class="nd-card__description">Revenue and retention for Q3.</p>
    </div>
    <div class="nd-card__content">
        <p>Download the PDF or open the dashboard.</p>
    </div>
    <div class="nd-card__footer">
        <button class="nd-button" data-variant="primary" type="button">Open</button>
        <button class="nd-button" data-variant="ghost" type="button">Share</button>
    </div>
</article>
```

Parts are optional; use only the ones the content needs. Put media first for a
flush cover image.

## Parts

| Class                   | Purpose                         |
| :---------------------- | :------------------------------ |
| `.nd-card__media`       | Full-bleed image or video       |
| `.nd-card__header`      | Title and description block     |
| `.nd-card__title`       | Card heading (choose the level) |
| `.nd-card__description` | Supporting line                 |
| `.nd-card__content`     | Body content                    |
| `.nd-card__footer`      | Actions or metadata             |

Add `.nd-card--interactive` when the whole card is a target; pair it with a real
link or button inside so keyboard users can act.

## Accessibility

- Use a heading (`h2`, `h3`, …) for the title and keep the page outline intact.
- Do not make a `<div>` clickable; put a link or button in the card.
- Give media an empty `alt` when it is decorative, or a real description when it
  carries information.

## Styling

Import `nd-card.css` after the tokens. The surface, border, radius, and shadow
come from the tokens; the interactive modifier switches to the accent border and
the raised shadow on hover/focus-within.
