[**@ndigo/dom v0.0.1**](../../README.md)

***

[@ndigo/dom](../../README.md) / [linkedom-dom-provider](../README.md) / LinkedomDOMProvider

# Class: LinkedomDOMProvider

A `DOMProvider` backed by linkedom for server-side or isomorphic
DOM operations without a real browser environment.

## Implements

- [`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md)

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

[`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md).[`createElement`](../../dom-provider/interfaces/DOMProvider.md#createelement)

***

### createFragment()

> **createFragment**(): `DocumentFragment`

Creates a `DocumentFragment` using the linkedom document.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

#### Implementation of

[`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md).[`createFragment`](../../dom-provider/interfaces/DOMProvider.md#createfragment)

***

### parseHTML()

> **parseHTML**(`html`): `Document`

Parses HTML using linkedom.

linkedom only assembles a real document when given a whole document: a
bare fragment like `<div>hello</div>` becomes the *document element*
(with an empty `<head>`/`<body>` nested inside it), and plain text or an
empty string leave `document.documentElement` null so any `body` access
throws. A browser `DOMParser` always yields `<html><head></head><body>…
fragment …</body></html>` instead. Fragments are therefore wrapped in
that skeleton so the `DOMProvider` contract holds identically across
providers.

#### Parameters

##### html

`string`

The HTML markup to parse.

#### Returns

`Document`

A `Document` representing the parsed HTML.

#### Implementation of

[`DOMProvider`](../../dom-provider/interfaces/DOMProvider.md).[`parseHTML`](../../dom-provider/interfaces/DOMProvider.md#parsehtml)
