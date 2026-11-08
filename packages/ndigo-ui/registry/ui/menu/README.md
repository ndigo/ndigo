# nd-menu

> Accessible dropdown menu built on the Zag.js menu machine.

`<nd-menu>` provides roving highlight, typeahead, and the ARIA menu contract
around your own markup.

## Markup

```html
<nd-menu>
    <button data-part="trigger">Actions</button>
    <div data-part="content">
        <div data-part="item" data-value="edit">Edit</div>
        <div data-part="item" data-value="archive">Archive</div>
        <div data-part="separator"></div>
        <div data-part="item" data-value="delete">Delete</div>
    </div>
</nd-menu>
```

A missing trigger is created from `trigger-label` (or `Open menu`). A missing
`content` and `positioner` wrapper are created on connect.

## Parts

| Part         | Element  | Purpose                                                        |
| :----------- | :------- | :------------------------------------------------------------- |
| `trigger`    | `button` | Opens the menu; carries `aria-haspopup`/`aria-expanded`        |
| `positioner` | `div`    | Popper positioning context                                     |
| `content`    | `div`    | Menu surface; carries `role="menu"`                            |
| `item`       | any      | `data-value` identifies the option; `data-valuetext` labels it |
| `separator`  | `div`    | Visual separator with `role="separator"`                       |

## Attributes

| Attribute       | Type      | Description                                     |
| :-------------- | :-------- | :---------------------------------------------- |
| `open`          | `boolean` | Controlled open state; reflected by the element |
| `trigger-label` | `string`  | Label for the generated trigger                 |

## Events

- `nd-select` — `detail: { value: string }`, emitted when an item is chosen.
- `nd-open-change` — `detail: { open: boolean }`.

## Keyboard

Arrow keys move the highlight, Home/End jump to the edges, printable
characters run typeahead, Enter selects, Escape closes, and Tab exits.

## Styling

Import `nd-menu.css` and the design tokens. Every visual value is a `--nd-*`
token; override the tokens rather than the selectors.

## Accessibility

Zag owns the menu role, `aria-activedescendant`, roving highlight, typeahead,
and dismissal. Items expose `data-highlighted` and `data-disabled` for styling.
