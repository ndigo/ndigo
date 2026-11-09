# nd-dialog

> Accessible modal dialog built on the Zag.js dialog machine.

`<nd-dialog>` wraps the platform-native modal pattern with Zag's focus trap,
dismissal handling, and ARIA wiring. Markup is yours; behaviour is the machine.

## Markup

```html
<nd-dialog>
    <button data-part="trigger">Invite teammate</button>
    <div data-part="content">
        <h2 data-part="title">Invite teammate</h2>
        <p data-part="description">They will receive an email invitation.</p>
        <button data-part="close-trigger">Close</button>
        <p>Your own body content goes here.</p>
    </div>
</nd-dialog>
```

A missing trigger is created from `trigger-label` (or `Open dialog`). Missing
`content`, `positioner`, and `backdrop` wrappers are created on connect, so the
short form with body markup alone also works.

## Parts

| Part            | Element  | Purpose                                                   |
| :-------------- | :------- | :-------------------------------------------------------- |
| `trigger`       | `button` | Opens the dialog; carries `aria-haspopup`/`aria-expanded` |
| `backdrop`      | `div`    | Full-viewport scrim                                       |
| `positioner`    | `div`    | Fixed positioning context                                 |
| `content`       | `div`    | Dialog surface; carries `role="dialog"`                   |
| `title`         | any      | Labelled by `aria-labelledby`                             |
| `description`   | any      | Described by `aria-describedby`                           |
| `close-trigger` | `button` | Closes the dialog                                         |

## Attributes

| Attribute       | Type      | Description                                     |
| :-------------- | :-------- | :---------------------------------------------- |
| `open`          | `boolean` | Controlled open state; reflected by the element |
| `trigger-label` | `string`  | Label for the generated trigger                 |
| `initial-focus` | `string`  | Selector for the element focused on open        |

## Events

- `nd-open-change` — `detail: { open: boolean }`, emitted when the dialog opens
  or closes.

## Methods

- `show()` / `hide()` — open or close programmatically without a trigger.

## Styling

Import `nd-dialog.css` and the design tokens. Every visual value is a `--nd-*`
token; override the tokens rather than the selectors.

## Accessibility

Zag owns focus trapping, initial focus, focus restore, Escape, outside-click
dismissal, body scroll locking, and the `aria-modal`/labelledby/describedby
contract. Provide a `title` or an `aria-label` on the element.
