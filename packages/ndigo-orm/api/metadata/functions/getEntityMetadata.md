[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [metadata](../README.md) / getEntityMetadata

# Function: getEntityMetadata()

> **getEntityMetadata**(`target`): [`EntityMetadata`](../interfaces/EntityMetadata.md)

Retrieves the entity metadata for a given class.

The result is derived once per class and cached; treat it as immutable.

## Parameters

### target

`Constructable`

The class constructor for which to retrieve metadata.

## Returns

[`EntityMetadata`](../interfaces/EntityMetadata.md)

The entity metadata.
