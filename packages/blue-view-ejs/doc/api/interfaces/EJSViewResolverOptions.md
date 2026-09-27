[**@blue/view-ejs v0.0.1**](../README.md)

***

[@blue/view-ejs](../README.md) / EJSViewResolverOptions

# Interface: EJSViewResolverOptions

Construction options for [EJSViewResolver](../classes/EJSViewResolver.md). Extends the shared view
options with the path framing this resolver applies around each name.

## Extends

- [`EJSViewOptions`](EJSViewOptions.md)

## Properties

### engine?

> `optional` **engine?**: [`EJSTemplateEngine`](../classes/EJSTemplateEngine.md)

The engine used to render template source. Defaults to a fresh
[EJSTemplateEngine](../classes/EJSTemplateEngine.md) when omitted.

#### Inherited from

[`EJSViewOptions`](EJSViewOptions.md).[`engine`](EJSViewOptions.md#engine)

***

### loader?

> `optional` **loader?**: [`ResourceLoader`](#)

Loader used to resolve template source by path when no inline
`template` is supplied. Falls back to the view's application context,
which is itself a [ResourceLoader](#).

#### Inherited from

[`EJSViewOptions`](EJSViewOptions.md).[`loader`](EJSViewOptions.md#loader)

***

### prefix?

> `optional` **prefix?**: `string`

Prefix applied before the resolved view name (e.g. `views/`).

***

### suffix?

> `optional` **suffix?**: `string`

Suffix applied after the resolved view name (e.g. `.html`).

***

### template?

> `optional` **template?**: `string`

An inline EJS template source. When set, it takes precedence over any
`path`/[ResourceLoader](#) during rendering.

#### Inherited from

[`EJSViewOptions`](EJSViewOptions.md).[`template`](EJSViewOptions.md#template)
