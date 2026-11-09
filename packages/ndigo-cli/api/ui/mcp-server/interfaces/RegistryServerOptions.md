[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/mcp-server](../README.md) / RegistryServerOptions

# Interface: RegistryServerOptions

Options for [createRegistryServer](../functions/createRegistryServer.md).

## Extends

- [`RegistryToolContext`](../../mcp-tools/interfaces/RegistryToolContext.md)

## Properties

### dir

> `readonly` **dir**: `string`

Application directory used for relative registry paths.

#### Inherited from

[`RegistryToolContext`](../../mcp-tools/interfaces/RegistryToolContext.md).[`dir`](../../mcp-tools/interfaces/RegistryToolContext.md#dir)

***

### readOnly?

> `readonly` `optional` **readOnly?**: `boolean`

Expose discovery tools only; omit `install_items`.

***

### registry?

> `readonly` `optional` **registry?**: `string`

Default registry source (file, directory, or URL).

#### Inherited from

[`RegistryToolContext`](../../mcp-tools/interfaces/RegistryToolContext.md).[`registry`](../../mcp-tools/interfaces/RegistryToolContext.md#registry)
