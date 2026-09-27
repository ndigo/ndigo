[**@blue/view-ejs v0.0.1**](../README.md)

***

[@blue/view-ejs](../README.md) / EJSTemplateEngine

# Class: EJSTemplateEngine

Renders EJS template strings to HTML using the `ejs` package.

The adapter operates purely on a source string and returns a string, so it is
platform-agnostic: it runs identically in Node and in a browser/jsdom test
environment. File resolution for path-backed views is owned by an injected
`ResourceLoader` (see `@blue/context`), keeping this package free of
platform I/O.

Templates are **compiled once per source string** and the compiled function
reused for every subsequent render — `ejs.render` re-compiles on every call,
and ejs's own cache requires a `filename` (+ `cache: true`), which the
engine never had. The compiled cache is bounded: when it exceeds its cap
it resets so long-lived processes cannot grow
it without limit. A template's compiled form therefore reflects the first
source seen for that string; inline templates are immutable strings, so
this is unobservable for all practical usage.

## Constructors

### Constructor

> **new EJSTemplateEngine**(`options?`): `EJSTemplateEngine`

#### Parameters

##### options?

[`EJSTemplateEngineOptions`](../interfaces/EJSTemplateEngineOptions.md) = `{}`

#### Returns

`EJSTemplateEngine`

## Methods

### render()

> **render**(`template`, `model`): `Promise`\<`string`\>

Render an EJS template string against the given model.

#### Parameters

##### template

`string`

The EJS template source.

##### model

`object` \| `null` \| `undefined`

The data model exposed to the template.

#### Returns

`Promise`\<`string`\>

The rendered HTML string.
