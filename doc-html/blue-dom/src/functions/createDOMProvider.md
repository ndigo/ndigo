[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dom/src](../README.md) / createDOMProvider

# Function: createDOMProvider()

> **createDOMProvider**(): `Promise`\<[`DOMProvider`](../interfaces/DOMProvider.md)\>

Defined in: [packages/blue-dom/src/create-dom-provider.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dom/src/create-dom-provider.ts#lines-14)

Creates an appropriate `DOMProvider` based on the current runtime environment.
Returns a `BrowserDOMProvider` when a browser DOM is available, or a
`LinkedomDOMProvider` for server-side environments.

## Returns

`Promise`\<[`DOMProvider`](../interfaces/DOMProvider.md)\>

A `DOMProvider` suitable for the current environment.
