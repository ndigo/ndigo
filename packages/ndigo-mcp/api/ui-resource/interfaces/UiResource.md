[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [ui-resource](../README.md) / UiResource

# Interface: UiResource

A `ui://` resource with its self-contained HTML.

## Properties

### description?

> `readonly` `optional` **description?**: `string`

Optional description shown by the host.

***

### html

> `readonly` **html**: `string`

The complete HTML document.

***

### name

> `readonly` **name**: `string`

Human-readable resource name.

***

### ui?

> `readonly` `optional` **ui?**: `Omit`\<[`UiMetadata`](UiMetadata.md), `"resourceUri"`\>

Presentation metadata, excluding the resource URI (added by the server).

***

### uri

> `readonly` **uri**: `string`

Resource URI (`ui://…`).
