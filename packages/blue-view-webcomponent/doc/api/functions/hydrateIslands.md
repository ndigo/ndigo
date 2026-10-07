[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / hydrateIslands

# Function: hydrateIslands()

> **hydrateIslands**(`root?`): `number`

Hydrates all islands in a root element: finds every `[data-blue-island]`
marker, connects it to its serialized `data-blue-model`, and drives the
element's first render.

Two shapes are supported:

- **Declarative Shadow DOM (DSD).** When the server emitted a
  `<template shadowrootmode="open">` child, the browser's HTML parser has
  already created a real shadow root on the marker before any script runs.
  That root is adopted *in place* — the element is upgraded (not re-created)
  and handed the locale/model, so the component's first render replaces the
  server-rendered fallback. Re-creating the element would discard the
  parsed root (and re-parse the fallback); `replaceWith` is therefore never
  used on this path.
- **Legacy light-DOM markers.** Without a shadow root, the inert SSR
  markup is replaced with a freshly constructed live element, as before.

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
