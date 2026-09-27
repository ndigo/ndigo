[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / parseAcceptLanguage

# Function: parseAcceptLanguage()

> **parseAcceptLanguage**(`header`): `string` \| `undefined`

Parses the first language tag from an `Accept-Language` header value.

## Parameters

### header

`string`

The raw `Accept-Language` header value.

## Returns

`string` \| `undefined`

The primary language tag, or `undefined`.

## Example

```ts
parseAcceptLanguage('fr-CH, fr;q=0.9, en;q=0.8'); // 'fr-CH'
parseAcceptLanguage('en-US,en;q=0.5');              // 'en-US'
```
