[**@ndigo/dom v0.0.1**](../README.md)

***

[@ndigo/dom](../README.md) / BrowserDOMProvider

# Class: BrowserDOMProvider

A `DOMProvider` backed by the native browser DOM APIs.
Requires a browser environment with `DOMParser` and `document` available.

## Implements

- [`DOMProvider`](../interfaces/DOMProvider.md)

## Constructors

### Constructor

> **new BrowserDOMProvider**(): `BrowserDOMProvider`

#### Returns

`BrowserDOMProvider`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### createElement()

> **createElement**(`tag`): `Element`

Creates an element using `document.createElement`.

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

Creates a `DocumentFragment` using `document.createDocumentFragment`.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`createFragment`](../interfaces/DOMProvider.md#createfragment)

***

### parseHTML()

> **parseHTML**(`html`): `Document`

Parses HTML using the native `DOMParser`.

#### Parameters

##### html

`string`

The HTML markup to parse.

#### Returns

`Document`

A `Document` representing the parsed HTML.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`parseHTML`](../interfaces/DOMProvider.md#parsehtml)
