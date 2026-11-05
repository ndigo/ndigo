[**@ndigo/dom v0.0.1**](../../README.md)

***

[@ndigo/dom](../../README.md) / [dom-provider](../README.md) / DOMProvider

# Interface: DOMProvider

Provides an isomorphic abstraction over DOM parsing and element creation.

## Since

1.0.0

## Author

Jeff Rose

## Methods

### createElement()

> **createElement**(`tag`): `Element`

Creates a new element with the given tag name.

#### Parameters

##### tag

`string`

The element tag name (e.g., `'div'`, `'span'`).

#### Returns

`Element`

A new `Element` instance.

***

### createFragment()

> **createFragment**(): `DocumentFragment`

Creates a new empty `DocumentFragment`.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

***

### parseHTML()

> **parseHTML**(`html`): `Document`

Parses an HTML string into a `Document`.

#### Parameters

##### html

`string`

The HTML markup to parse.

#### Returns

`Document`

A `Document` representing the parsed HTML.
