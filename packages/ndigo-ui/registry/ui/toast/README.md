# nd-toast

> Transient notification with a live-region contract.

`<nd-toast>` is deliberately native-first: the Zag toast machine is group-scoped
(it requires a parent group service), while this item is a single toast. The
element owns visibility, the auto-dismiss timer, and the `role`/`aria-live`
contract; a queue/group item can compose it later.

## Markup

```html
<nd-toast type="success" duration="5000">
    <span data-part="title">Saved</span>
    <span data-part="description">Your changes are live.</span>
    <button data-part="close-trigger">Dismiss</button>
</nd-toast>
```

## Attributes

| Attribute  | Type      | Description                                     |
| :--------- | :-------- | :---------------------------------------------- |
| `type`     | `string`  | `info`, `success`, `warning`, or `error`        |
| `duration` | `number`  | Auto-dismiss delay in ms; `0` keeps it open     |
| `open`     | `boolean` | Controlled visibility; reflected by the element |

## Events

- `nd-open-change` — `detail: { open: boolean }`.

## Methods

- `show()` — reveal the toast and restart the timer.
- `hide()` — dismiss the toast.

## Accessibility

The host is `role="status"` with `aria-live="polite"` for informational toasts;
`warning`/`error` switch to `role="alert"` and `aria-live="assertive"`. The
content is atomic, so updates are announced as one message. Keep the text short
and provide a close trigger; the timer pauses are out of scope for the single
toast.

## Styling

Import `nd-toast.css` after the tokens. It is fixed to the bottom-end corner,
uses the raised surface and shadow tokens, and tints the inline-start border by
type.
