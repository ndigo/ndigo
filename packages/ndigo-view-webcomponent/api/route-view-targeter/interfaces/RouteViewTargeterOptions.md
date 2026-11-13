[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [route-view-targeter](../README.md) / RouteViewTargeterOptions

# Interface: RouteViewTargeterOptions

Options for [RouteViewTargeter](../classes/RouteViewTargeter.md).

## Extends

- [`SelectorViewTargeterOptions`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md)

## Properties

### document?

> `optional` **document?**: `Document`

Document searched for selectors. Defaults to the global `document`.

#### Inherited from

[`SelectorViewTargeterOptions`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md).[`document`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md#document)

***

### eventMap?

> `optional` **eventMap?**: `Record`\<`string`, `string`\>

DOM event → application event map bridged by cached targets.

#### Inherited from

[`SelectorViewTargeterOptions`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md).[`eventMap`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md#eventmap)

***

### mount?

> `optional` **mount?**: [`ViewTargetMount`](../../selector-view-targeter/type-aliases/ViewTargetMount.md)

Mount mode for resolved elements. Defaults to `element`.

#### Inherited from

[`SelectorViewTargeterOptions`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md).[`mount`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md#mount)

***

### pathMatcher?

> `optional` **pathMatcher?**: `PathMatcher`

The pattern matcher. Defaults to `URLGlobPathMatcher`.
