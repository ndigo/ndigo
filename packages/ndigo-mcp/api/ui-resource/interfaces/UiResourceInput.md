[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [ui-resource](../README.md) / UiResourceInput

# Interface: UiResourceInput

Inputs for [createUiResource](../functions/createUiResource.md).

## Properties

### body

> `readonly` **body**: `string`

Markup placed inside `<body>`.

***

### csp?

> `readonly` `optional` **csp?**: [`UiCspConfig`](UiCspConfig.md)

Content-Security-Policy domains declared to the host.

***

### css?

> `readonly` `optional` **css?**: `string`

CSS inlined in a `<style>` element.

***

### description?

> `readonly` `optional` **description?**: `string`

Optional description.

***

### domain?

> `readonly` `optional` **domain?**: `string`

Requested sandbox domain.

***

### lang?

> `readonly` `optional` **lang?**: `string`

Document language (default `en`).

***

### name

> `readonly` **name**: `string`

Resource name.

***

### permissions?

> `readonly` `optional` **permissions?**: readonly `string`[]

Requested browser capabilities.

***

### prefersBorder?

> `readonly` `optional` **prefersBorder?**: `boolean`

Ask the host for a border.

***

### script?

> `readonly` `optional` **script?**: `string`

JavaScript inlined in a `<script>` element.

***

### scriptType?

> `readonly` `optional` **scriptType?**: `"module"` \| `"classic"`

Script type (default `module`).

***

### title?

> `readonly` `optional` **title?**: `string`

Document title (escaped).

***

### uri

> `readonly` **uri**: `string`

Resource URI (`ui://…`).

***

### visibility?

> `readonly` `optional` **visibility?**: readonly [`UiVisibility`](../type-aliases/UiVisibility.md)[]

Tool visibility metadata.
