[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dom/src](../README.md) / LinkedomDOMProvider

# Class: LinkedomDOMProvider

Defined in: [packages/blue-dom/src/linkedom-dom-provider.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/linkedom-dom-provider.ts#lines-12)

A `DOMProvider` backed by linkedom for server-side or isomorphic
DOM operations without a real browser environment.

## Implements

- [`DOMProvider`](../interfaces/DOMProvider.md)

## Constructors

### Constructor

> **new LinkedomDOMProvider**(): `LinkedomDOMProvider`

Defined in: [packages/blue-dom/src/linkedom-dom-provider.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/linkedom-dom-provider.ts#lines-19)

#### Returns

`LinkedomDOMProvider`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dom/src/linkedom-dom-provider.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/linkedom-dom-provider.ts#lines-15)

##### Returns

`string`

## Methods

### parseHTML()

> **parseHTML**(`html`): `Document`

Defined in: [packages/blue-dom/src/linkedom-dom-provider.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/linkedom-dom-provider.ts#lines-31)

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

***

### createElement()

> **createElement**(`tag`): `Element`

Defined in: [packages/blue-dom/src/linkedom-dom-provider.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/linkedom-dom-provider.ts#lines-42)

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

Defined in: [packages/blue-dom/src/linkedom-dom-provider.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/linkedom-dom-provider.ts#lines-51)

Creates a `DocumentFragment` using the linkedom document.

#### Returns

`DocumentFragment`

A new `DocumentFragment`.

#### Implementation of

[`DOMProvider`](../interfaces/DOMProvider.md).[`createFragment`](../interfaces/DOMProvider.md#createfragment)
