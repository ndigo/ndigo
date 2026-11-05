[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [view-mapping](../README.md) / ViewMapping

# Variable: ViewMapping

> `const` **ViewMapping**: ((`viewName`) => \<`T`\>(`target`, `context`) => `T`) & `object`

Registers a view name in decorator metadata for later lookup.

## Type Declaration

### define

> **define**: (`value`, `target`) => `void` = `defineViewMapping`

Writes a view mapping to the target's metadata.

#### Parameters

##### value

`string`

The view name to store.

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`void`

### delete

> **delete**: (`target`) => `void` = `deleteViewMapping`

Removes any stored view mapping from the target's metadata.

#### Parameters

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`void`

### get

> **get**: (`target`) => `string` \| `undefined` = `getViewMapping`

Reads the stored view mapping for a target.

#### Parameters

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`string` \| `undefined`

The view name, or `undefined` when none has been recorded.

### has

> **has**: (`target`) => `boolean` = `hasViewMapping`

Tests whether a target has a stored view mapping.

#### Parameters

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`boolean`

`true` when a view mapping is present.

## Param

**viewName**

The view name to associate with the decorated class.

## Returns

A class decorator that stores the view name in metadata.
