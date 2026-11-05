[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [cookie-parser](../README.md) / CookieParseOptions

# Interface: CookieParseOptions

Limits applied while parsing a `Cookie` header: how many cookies are kept
(`maxCookies`) and how long a single value may be (`maxValueBytes`). Values
beyond either bound are rejected rather than truncated.

## Properties

### maxCookies?

> `optional` **maxCookies?**: `number`

Maximum number of cookies parsed per request (default 50).

***

### maxValueBytes?

> `optional` **maxValueBytes?**: `number`

Maximum byte length of any single cookie value (default 4096).
