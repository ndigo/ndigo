[**@ndigo/dom v0.0.1**](../README.md)

***

[@ndigo/dom](../README.md) / createDOMProvider

# Function: createDOMProvider()

> **createDOMProvider**(): `Promise`\<[`DOMProvider`](../interfaces/DOMProvider.md)\>

Creates an appropriate `DOMProvider` based on the current runtime environment.
Returns a `BrowserDOMProvider` when a browser DOM is available, or a
`LinkedomDOMProvider` for server-side environments.

## Returns

`Promise`\<[`DOMProvider`](../interfaces/DOMProvider.md)\>

A `DOMProvider` suitable for the current environment.
