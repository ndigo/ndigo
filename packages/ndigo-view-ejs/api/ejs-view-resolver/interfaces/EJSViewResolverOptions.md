[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-view-resolver](../README.md) / EJSViewResolverOptions

# Interface: EJSViewResolverOptions

Construction options for [EJSViewResolver](../classes/EJSViewResolver.md). Extends the shared view
options with the path framing this resolver applies around each name.

## Extends

- [`EJSViewOptions`](../../ejs-view/interfaces/EJSViewOptions.md)

## Properties

### engine?

> `optional` **engine?**: [`EJSTemplateEngine`](../../ejs-template-engine/classes/EJSTemplateEngine.md)

The engine used to render template source. Defaults to a fresh
[EJSTemplateEngine](../../ejs-template-engine/classes/EJSTemplateEngine.md) when omitted.

#### Inherited from

[`EJSViewOptions`](../../ejs-view/interfaces/EJSViewOptions.md).[`engine`](../../ejs-view/interfaces/EJSViewOptions.md#engine)

***

### loader?

> `optional` **loader?**: [`ResourceLoader`](#)

Loader used to resolve template source by path when no inline
`template` is supplied. Falls back to the view's application context,
which is itself a [ResourceLoader](#).

#### Inherited from

[`EJSViewOptions`](../../ejs-view/interfaces/EJSViewOptions.md).[`loader`](../../ejs-view/interfaces/EJSViewOptions.md#loader)

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

[`EJSViewOptions`](../../ejs-view/interfaces/EJSViewOptions.md).[`template`](../../ejs-view/interfaces/EJSViewOptions.md#template)
