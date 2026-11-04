[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / parseModel

# Function: parseModel()

> **parseModel**(`raw`): `unknown`

Parses a serialized island model back into a JS value.

The input MUST already be the browser-delivered, ONE-LEVEL-decoded attribute
value: the HTML parser decodes `&quot;`/`&amp;`/`&lt;`/`&gt;` when it reads
`data-ndigo-model`, so this function treats `raw` as plain JSON and parses it
directly. Decoding a second time here would corrupt any model text that was
entity-escaped by [serializeModel](serializeModel.md) (e.g. a literal `&lt;script&gt;`
would become a live element after hydration).

## Parameters

### raw

`string` \| `undefined`

The `data-ndigo-model` attribute value as returned by
  `getAttribute` (one-level HTML-decoded by the DOM parser).

## Returns

`unknown`

The parsed model, or `null` when absent/invalid.
