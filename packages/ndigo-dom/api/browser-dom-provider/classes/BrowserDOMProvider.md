[**@ndigo/dom v0.0.1**](../../README.md)

***

[@ndigo/dom](../../README.md) / [browser-dom-provider](../README.md) / BrowserDOMProvider

# Class: BrowserDOMProvider

A `DOMProvider` backed by the native browser DOM APIs.
Requires a browser environment with `DOMParser` and `document` available.

## Implements

- [`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md)

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

[`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md).[`createElement`](../../dom-provider/interfaces/DOMProvider.md#createelement)

***

### createFragment()

> **createFragment**(): `DocumentFragment`

Creates a `DocumentFragment` using `document.createDocumentFragment`.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

#### Implementation of

[`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md).[`createFragment`](../../dom-provider/interfaces/DOMProvider.md#createfragment)

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

[`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md).[`parseHTML`](../../dom-provider/interfaces/DOMProvider.md#parsehtml)
