[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/catalog](../README.md) / A2uiCatalog

# Interface: A2uiCatalog

The A2UI catalog document.

## Properties

### $defs

> `readonly` **$defs**: `object`

The `anyComponent` union used by A2UI payloads.

#### anyComponent

> `readonly` **anyComponent**: `object`

##### anyComponent.discriminator

> `readonly` **discriminator**: `object`

##### anyComponent.discriminator.propertyName

> `readonly` **propertyName**: `"component"`

##### anyComponent.oneOf

> `readonly` **oneOf**: readonly `object`[]

***

### $schema

> `readonly` **$schema**: `string`

JSON Schema dialect.

***

### catalogId

> `readonly` **catalogId**: `string`

Unique catalog identifier.

***

### components

> `readonly` **components**: `Record`\<`string`, [`A2uiComponentDescriptor`](A2uiComponentDescriptor.md)\>

Component definitions keyed by component name.

***

### protocolVersion

> `readonly` **protocolVersion**: `string`

A2UI protocol version.
