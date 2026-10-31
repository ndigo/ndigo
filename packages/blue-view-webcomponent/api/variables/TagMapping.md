[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / TagMapping

# Variable: TagMapping

> `const` **TagMapping**: ((`tagName`) => \<`T`\>(`target`, `context`) => `T`) & `object`

Registers a custom element name and stores it in decorator metadata.

The decorator also defines the element immediately so the class can be instantiated
through the browser's custom elements registry.

## Type Declaration

### define

> **define**: (`value`, `target`) => `void` = `defineTagMapping`

Writes a tag mapping to the target's metadata.

#### Parameters

##### value

`string`

The tag name to store.

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`void`

### delete

> **delete**: (`target`) => `void` = `deleteTagMapping`

Removes any stored tag mapping from the target's metadata.

#### Parameters

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`void`

### get

> **get**: (`target`) => `string` \| `undefined` = `getTagMapping`

Reads the stored tag mapping for a target.

#### Parameters

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`string` \| `undefined`

The tag name, or `undefined` when none has been recorded.

### has

> **has**: (`target`) => `boolean` = `hasTagMapping`

Tests whether a target has a stored tag mapping.

#### Parameters

##### target

`unknown`

The decorated class or constructor-like target.

#### Returns

`boolean`

`true` when a tag mapping is present.

## Param

**tagName**

The custom element tag name to associate with the class.

## Returns

A class decorator that records and registers the tag name.
