# nd-tabs

> Accessible tab set built on the Zag.js tabs machine.

`<nd-tabs>` provides the tablist/tab/tabpanel roles, roving focus, and
arrow-key navigation. The panels stay in the DOM and are hidden when inactive.

## Markup

```html
<nd-tabs value="overview">
    <div data-part="root">
        <div data-part="list">
            <button data-part="trigger" data-value="overview">Overview</button>
            <button data-part="trigger" data-value="install">Install</button>
        </div>
        <div data-part="content" data-value="overview">Overview panel</div>
        <div data-part="content" data-value="install">Install panel</div>
    </div>
</nd-tabs>
```

A root wrapper is created when absent. Every trigger and panel needs a
`data-value`; the trigger and panel with the same value pair automatically.

## Attributes

| Attribute | Type     | Description                                          |
| :-------- | :------- | :--------------------------------------------------- |
| `value`   | `string` | Initial selected value; also settable via `select()` |

## Events

- `nd-value-change` — `detail: { value: string | null }`.

## Methods

- `select(value)` — select a tab by value.

## Keyboard and accessibility

Arrow keys move focus (and select, in the default automatic activation mode);
Home/End jump to the edges. The list is `role="tablist"`, triggers are
`role="tab"` with `aria-selected`, and panels are `role="tabpanel"` labelled by
their trigger.

## Styling

The selected trigger uses the accent border and text tokens; disabled triggers
fade. Import `nd-tabs.css` after the tokens.
