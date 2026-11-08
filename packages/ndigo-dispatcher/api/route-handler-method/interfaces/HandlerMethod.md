[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-method](../README.md) / HandlerMethod

# Interface: HandlerMethod

A handler bound to a route: `invoke` receives the `Route` as its first
argument and returns the handler's result (`ModelAndView`, a view name, a
value).

## Extends

- [`Invocable`](Invocable.md)

## Methods

### invoke()

> **invoke**\<`ModelAndView`\>(`route`, ...`args`): `ModelAndView`

Invokes the handler with the resolved route.

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

The route being resolved.

##### args

...`unknown`[]

Additional invocation arguments.

#### Returns

`ModelAndView`

The handler's result.

#### Overrides

[`Invocable`](Invocable.md).[`invoke`](Invocable.md#invoke)
