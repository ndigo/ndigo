[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-targeter](../README.md) / ViewTargetingContext

# Interface: ViewTargetingContext

Everything a [ViewTargeter](ViewTargeter.md) may inspect to choose a destination.

The context is assembled by the dispatcher once per render pass and only
when a targeter chain is configured — a platform that renders into its
single registered target never pays for it.

## Properties

### language

> `readonly` **language**: `string`

The negotiated language.

***

### model

> `readonly` **model**: `unknown`

The model passed to the view.

***

### route

> `readonly` **route**: [`Route`](#)

The route being rendered.

***

### view

> `readonly` **view**: [`View`](../../view/interfaces/View.md) \| `null`

The resolved view instance, when available.

***

### viewName

> `readonly` **viewName**: `string` \| `null`

The logical view name, when the result carried one.
