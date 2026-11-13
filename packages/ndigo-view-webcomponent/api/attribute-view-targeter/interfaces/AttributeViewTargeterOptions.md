[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [attribute-view-targeter](../README.md) / AttributeViewTargeterOptions

# Interface: AttributeViewTargeterOptions

Options for [AttributeViewTargeter](../classes/AttributeViewTargeter.md).

## Extends

- [`SelectorViewTargeterOptions`](../../selector-view-targeter/interfaces/SelectorViewTargeterOptions.md)

## Properties

### attribute?

> `optional` **attribute?**: `string`

Route-attribute key holding the selector. Defaults to `viewTarget`.

The value must be selector text from static configuration. Route
attributes can carry request-derived data, so never populate this key
from user input without escaping.

***

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
