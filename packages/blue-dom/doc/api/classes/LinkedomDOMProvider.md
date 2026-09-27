[**@blue/dom v0.0.1**](../README.md)

***

[@blue/dom](../README.md) / LinkedomDOMProvider

# Class: LinkedomDOMProvider

A `DOMProvider` backed by linkedom for server-side or isomorphic
DOM operations without a real browser environment.

## Implements

- [`DOMProvider`](../interfaces/DOMProvider.md)

## Constructors

### Constructor

> **new LinkedomDOMProvider**(): `LinkedomDOMProvider`

#### Returns

`LinkedomDOMProvider`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### createElement()

> **createElement**(`tag`): `Element`

Creates an element using the linkedom document.

#### Parameters

##### tag

`string`

The element tag name.

#### Returns

`Element`

A new `Element`.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`createElement`](../interfaces/DOMProvider.md#createelement)

***

### createFragment()

> **createFragment**(): `DocumentFragment`

Creates a `DocumentFragment` using the linkedom document.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`createFragment`](../interfaces/DOMProvider.md#createfragment)

***

### parseHTML()

> **parseHTML**(`html`): `Document`

Parses HTML using linkedom.

#### Parameters

##### html

`string`

The HTML markup to parse.

#### Returns

`Document`

A `Document` representing the parsed HTML.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`parseHTML`](../interfaces/DOMProvider.md#parsehtml)
