[**@ndigo/generators v0.0.1**](../README.md)

***

[@ndigo/generators](../README.md) / AppGeneratorSchema

# Interface: AppGeneratorSchema

## Properties

### description?

> `optional` **description?**: `string`

One-line description used in the manifest and README.

***

### kind

> **kind**: [`AppKind`](../type-aliases/AppKind.md)

`browser` (Vite SPA) or `node` (HTTP server) scaffold.

***

### name

> **name**: `string`

App slug (kebab-case, without the `ndigo-` prefix).

***

### number?

> `optional` **number?**: `number`

Reading-order number (defaults to one past the highest existing app).

***

### port?

> `optional` **port?**: `number`

Dev port (defaults to the first free multiple-of-ten slot above 3000).
