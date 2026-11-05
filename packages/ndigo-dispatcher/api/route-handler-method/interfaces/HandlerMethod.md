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

#### Type Parameters

##### ModelAndView

`ModelAndView`

#### Parameters

##### route

[`Route`](#)

##### args

...`unknown`[]

#### Returns

`ModelAndView`

#### Overrides

[`Invocable`](Invocable.md).[`invoke`](Invocable.md#invoke)
