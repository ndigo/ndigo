[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [selector-view-targeter](../README.md) / SelectorViewTargeterOptions

# Interface: SelectorViewTargeterOptions

Options for [SelectorViewTargeter](../classes/SelectorViewTargeter.md).

## Extended by

- [`AttributeViewTargeterOptions`](../../attribute-view-targeter/interfaces/AttributeViewTargeterOptions.md)
- [`RouteViewTargeterOptions`](../../route-view-targeter/interfaces/RouteViewTargeterOptions.md)

## Properties

### document?

> `optional` **document?**: `Document`

Document searched for selectors. Defaults to the global `document`.

***

### eventMap?

> `optional` **eventMap?**: `Record`\<`string`, `string`\>

DOM event → application event map bridged by cached targets.

***

### mount?

> `optional` **mount?**: [`ViewTargetMount`](../type-aliases/ViewTargetMount.md)

Mount mode for resolved elements. Defaults to `element`.
