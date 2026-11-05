[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-view](../README.md) / EJSViewOptions

# Interface: EJSViewOptions

Construction options for [EJSView](../classes/EJSView.md).

## Extended by

- [`EJSViewResolverOptions`](../../ejs-view-resolver/interfaces/EJSViewResolverOptions.md)

## Properties

### engine?

> `optional` **engine?**: [`EJSTemplateEngine`](../../ejs-template-engine/classes/EJSTemplateEngine.md)

The engine used to render template source. Defaults to a fresh
[EJSTemplateEngine](../../ejs-template-engine/classes/EJSTemplateEngine.md) when omitted.

***

### loader?

> `optional` **loader?**: [`ResourceLoader`](#)

Loader used to resolve template source by path when no inline
`template` is supplied. Falls back to the view's application context,
which is itself a [ResourceLoader](#).

***

### template?

> `optional` **template?**: `string`

An inline EJS template source. When set, it takes precedence over any
`path`/[ResourceLoader](#) during rendering.
