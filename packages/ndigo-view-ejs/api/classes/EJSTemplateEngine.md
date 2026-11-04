[**@ndigo/view-ejs v0.0.1**](../README.md)

***

[@ndigo/view-ejs](../README.md) / EJSTemplateEngine

# Class: EJSTemplateEngine

Renders EJS template strings to HTML using the `ejs` package.

The adapter operates purely on a source string and returns a string, so it is
platform-agnostic: it runs identically in Node and in a browser/jsdom test
environment. File resolution for path-backed views is owned by an injected
`ResourceLoader` (see `@ndigo/context`), keeping this package free of
platform I/O.

Templates are compiled in **async mode** (`async: true`): methods are async
by convention in Ndigo, so locale helpers like `t` resolve to promises and
template expressions await them (`<%= await t('key') %>`). Plain synchronous
interpolations are unaffected.

Templates are **compiled once per (filename, source) key** and the compiled
function reused for every subsequent render — `ejs.render` re-compiles on
every call, and ejs's own cache requires `cache: true`. The filename is part
of the key because it changes how `include(...)` paths resolve. The compiled
cache is bounded: when it exceeds its cap it resets so long-lived processes
cannot grow it without limit. A template's compiled form therefore reflects
the first source seen for that key; inline templates are immutable strings,
so this is unobservable for all practical usage.

`include(...)` targets are resolved and read from the filesystem by ejs. Each
render threads a guarded `include` local through the include chain, so a
cyclic include (a includes b includes a) fails fast with a bounded, named
[EJSIncludeCycleError](EJSIncludeCycleError.md) instead of overflowing the call stack. The guard
relies on ejs's default `with (locals)` scoping; an `options.strict: true`
(which disables `with`) opts out of it, as does any template that references
ejs's own `include` parameter directly.

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

> **render**(`template`, `model`, `filename?`): `Promise`\<`string`\>

Render an EJS template string against the given model.

#### Parameters

##### template

`string`

The EJS template source.

##### model

`object` \| `null` \| `undefined`

The data model exposed to the template.

##### filename?

`string`

Optional path of the template source. ejs uses it to
  resolve `include(...)` paths: a relative include resolves next to this
  file. Omit it for inline templates — relative includes then cannot
  resolve. Includes are async in this engine, so templates MUST write
  `<%- await include('partial') %>`; an un-awaited include interpolates a
  `Promise` and renders as `[object Promise]`.

#### Returns

`Promise`\<`string`\>

The rendered HTML string.
