[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / changeLocale

# Function: changeLocale()

> **changeLocale**(`language`): `void`

Sets the active locale on the client.

Persists the user's choice (cookie) and updates [currentLocale](../variables/currentLocale.md),
so subscribed views re-render with the new locale. Subsequent requests
resolve the cookie first via [CookieLanguageResolver](../classes/CookieLanguageResolver.md).

Invalid tags (non-BCP 47, markup characters, overlong) are ignored —
the current locale and cookie are left untouched.

## Parameters

### language

`string`

The language tag to activate.

## Returns

`void`
