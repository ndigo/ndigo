[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [ui-resource](../README.md) / UiMetadata

# Interface: UiMetadata

`_meta.ui` metadata for a tool or resource.

## Properties

### csp?

> `readonly` `optional` **csp?**: [`UiCspConfig`](UiCspConfig.md)

External domains the host should allow.

***

### domain?

> `readonly` `optional` **domain?**: `string`

Request a dedicated sandbox origin (host-dependent).

***

### permissions?

> `readonly` `optional` **permissions?**: readonly `string`[]

Browser capabilities the app requests (`camera`, `clipboardWrite`, …).

***

### prefersBorder?

> `readonly` `optional` **prefersBorder?**: `boolean`

Ask the host to draw a border.

***

### resourceUri

> `readonly` **resourceUri**: `string`

The `ui://` resource the host renders.

***

### visibility?

> `readonly` `optional` **visibility?**: readonly [`UiVisibility`](../type-aliases/UiVisibility.md)[]

Who may call the tool (defaults to the host's policy).
