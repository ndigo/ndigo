[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/view-targeter-strategy](../README.md) / ViewTargeterStrategy

# Interface: ViewTargeterStrategy

Strategy mixin contract for view targeting: exposes the ordered
`viewTargeters` that choose where a rendered view is committed, and an
initializer that installs them from the application context.

## Properties

### viewTargeters

> **viewTargeters**: `ViewTargeter`[]

The ordered view targeters.

## Methods

### initViewTargeters()

> **initViewTargeters**(`context`): `void`

Installs the view-targeter chain.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
