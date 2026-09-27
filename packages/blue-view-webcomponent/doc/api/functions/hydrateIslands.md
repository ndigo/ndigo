[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / hydrateIslands

# Function: hydrateIslands()

> **hydrateIslands**(`root?`): `number`

Hydrates all islands in a root element: finds every `[data-blue-island]`
marker, constructs the corresponding custom element, sets its `.model` from
the serialized `data-blue-model`, and replaces the inert SSR markup with the
live element (its `connectedCallback`/render runs on connect).

Custom elements must already be defined (`customElements.define` via
`@TagMapping` at module import) for synchronous upgrade; otherwise the
element stays an `HTMLUnknownElement` and is left untouched.

## Parameters

### root?

`ParentNode` = `document`

The root element to scan; defaults to `document`.

## Returns

`number`

The number of islands hydrated.

## Example

```ts
import { hydrateIslands } from '@blue/view-webcomponent';
const n = hydrateIslands();
```

## Since

1.0.0
