[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [negotiation](../README.md) / parseAcceptLanguage

# Function: parseAcceptLanguage()

> **parseAcceptLanguage**(`header`): `string` \| `undefined`

Parses the preferred language tag from an `Accept-Language` header value.

Tags are ranked by their `q` weight (default `1`); `q=0` entries (explicitly
unacceptable) and the `*` wildcard are ignored. Ties keep the header order.

## Parameters

### header

`string`

The raw `Accept-Language` header value.

## Returns

`string` \| `undefined`

The preferred language tag, or `undefined`.

## Example

```ts
parseAcceptLanguage('fr-CH, fr;q=0.9, en;q=0.8'); // 'fr-CH'
parseAcceptLanguage('en;q=0.5, fr;q=0.9');        // 'fr'
parseAcceptLanguage('de;q=0, en;q=0.8');          // 'en'
parseAcceptLanguage('*');                          // undefined
```
