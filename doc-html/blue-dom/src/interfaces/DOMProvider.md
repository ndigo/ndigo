[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dom/src](../README.md) / DOMProvider

# Interface: DOMProvider

Defined in: [packages/blue-dom/src/dom-provider.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/dom-provider.ts#lines-10)

Provides an isomorphic abstraction over DOM parsing and element creation.
Implementations back this interface with either native browser APIs or
a server-side DOM library such as linkedom.

## Methods

### parseHTML()

> **parseHTML**(`html`): `Document`

Defined in: [packages/blue-dom/src/dom-provider.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/dom-provider.ts#lines-17)

Parses an HTML string into a `Document`.

#### Parameters

##### html

`string`

The HTML markup to parse.

#### Returns

`Document`

A `Document` representing the parsed HTML.

***

### createElement()

> **createElement**(`tag`): `Element`

Defined in: [packages/blue-dom/src/dom-provider.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/dom-provider.ts#lines-25)

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

Defined in: [packages/blue-dom/src/dom-provider.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/dom-provider.ts#lines-32)

Creates a new empty `DocumentFragment`.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.
