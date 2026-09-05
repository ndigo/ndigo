[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dom/src](../README.md) / BrowserDOMProvider

# Class: BrowserDOMProvider

Defined in: [packages/blue-dom/src/browser-dom-provider.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/browser-dom-provider.ts#lines-11)

A `DOMProvider` backed by the native browser DOM APIs.
Requires a browser environment with `DOMParser` and `document` available.

## Implements

- [`DOMProvider`](../interfaces/DOMProvider.md)

## Constructors

### Constructor

> **new BrowserDOMProvider**(): `BrowserDOMProvider`

Defined in: [packages/blue-dom/src/browser-dom-provider.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/browser-dom-provider.ts#lines-18)

#### Returns

`BrowserDOMProvider`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dom/src/browser-dom-provider.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/browser-dom-provider.ts#lines-14)

##### Returns

`string`

## Methods

### parseHTML()

> **parseHTML**(`html`): `Document`

Defined in: [packages/blue-dom/src/browser-dom-provider.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/browser-dom-provider.ts#lines-28)

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

***

### createElement()

> **createElement**(`tag`): `Element`

Defined in: [packages/blue-dom/src/browser-dom-provider.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/browser-dom-provider.ts#lines-38)

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

Defined in: [packages/blue-dom/src/browser-dom-provider.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/browser-dom-provider.ts#lines-47)

Creates a `DocumentFragment` using `document.createDocumentFragment`.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`createFragment`](../interfaces/DOMProvider.md#createfragment)
