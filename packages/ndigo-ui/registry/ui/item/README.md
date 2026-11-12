# nd-item

> List row with media, text, and actions.

## Usage

```html
<ul>
    <li class="nd-item nd-item--bordered">
        <span class="nd-item__media">AL</span>
        <div class="nd-item__content">
            <span class="nd-item__title">Ada Lovelace</span>
            <span class="nd-item__description">Engineering</span>
        </div>
        <div class="nd-item__actions">
            <button class="nd-button" data-variant="ghost" data-size="sm" type="button">Edit</button>
        </div>
    </li>
</ul>
```

## Parts

| Class                   | Purpose                            |
| :---------------------- | :--------------------------------- |
| `.nd-item__media`       | Leading avatar, icon, or thumbnail |
| `.nd-item__content`     | Primary and secondary text         |
| `.nd-item__title`       | Emphasized one-line label          |
| `.nd-item__description` | Muted supporting line              |
| `.nd-item__actions`     | Trailing buttons or metadata       |

Add `.nd-item--bordered` for a surface row and `data-selected` for a selected
row (pair it with `aria-selected` when the list is selectable).

## Accessibility

- Use `<li>` inside a list, or `role="list"`/`listitem` when another element is
  required.
- Give every action an accessible name; icon-only buttons need `aria-label`.
- Do not make the row itself clickable with a `<div>`; put the link or button in
  the title or actions.

## Styling

Import `nd-item.css` after the tokens. Hover and selection use the accent-soft
token; the media circle uses the raised surface.
