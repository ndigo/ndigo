[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [locale](../README.md) / currentLocale

# Variable: currentLocale

> `const` **currentLocale**: `Signal`\<`string`\>

Reactive locale state for the browser — views subscribed to this signal
re-render and re-format when the locale changes.

Backed by a lazily-created signal so importing the module outside a DOM
never touches `document`/`navigator`.
