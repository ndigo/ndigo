[**@ndigo/generators v0.0.1**](../../../../README.md)

***

[@ndigo/generators](../../../../README.md) / [generators/app/generator](../README.md) / AppGeneratorSchema

# Interface: AppGeneratorSchema

Options for the `app` generator: the slug, the scaffold kind (`browser`
Vite SPA or `node` HTTP server), and optional reading-order number and dev
port. Allocation defaults to the first free slot, and explicit values that
collide fail the run.

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
