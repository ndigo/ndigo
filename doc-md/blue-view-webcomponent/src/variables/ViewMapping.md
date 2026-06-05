[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / ViewMapping

# Variable: ViewMapping

> `const` **ViewMapping**: (`viewName`) => \<`T`\>(`target`, `context`) => `T` & `object`

Defined in: packages/blue-view-webcomponent/src/view-mapping.ts:44

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

`any`

The decorated class or constructor-like target.

#### Returns

`void`

### delete

> **delete**: (`target`) => `void` = `deleteViewMapping`

Removes any stored view mapping from the target's metadata.

#### Parameters

##### target

`any`

The decorated class or constructor-like target.

#### Returns

`void`

### get

> **get**: (`target`) => `string` = `getViewMapping`

Reads the stored view mapping for a target.

#### Parameters

##### target

`any`

The decorated class or constructor-like target.

#### Returns

`string`

The view name, or `undefined` when none has been recorded.

### has

> **has**: (`target`) => `boolean` = `hasViewMapping`

Tests whether a target has a stored view mapping.

#### Parameters

##### target

`any`

The decorated class or constructor-like target.

#### Returns

`boolean`

`true` when a view mapping is present.

## Param

The view name to associate with the decorated class.

## Returns

A class decorator that stores the view name in metadata.
