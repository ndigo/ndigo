[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [patterns-route-condition](../README.md) / PatternsRouteCondition

# Class: PatternsRouteCondition

Contract for route matching conditions.

## Extends

- [`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md)\<`PatternsRouteCondition`\>

## Constructors

### Constructor

> **new PatternsRouteCondition**(...`patterns`): `PatternsRouteCondition`

Create a condition from one or more patterns.

#### Parameters

##### patterns

...`string`[]

Route patterns to use.

#### Returns

`PatternsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`constructor`](../../route-condition/classes/AbstractRouteCondition.md#constructor)

### Constructor

> **new PatternsRouteCondition**(`patterns`, `routeCondition?`): `PatternsRouteCondition`

Create a condition from a prebuilt pattern set.

#### Parameters

##### patterns

`Set`\<`string`\>

The pattern set to use.

##### routeCondition?

`PatternsRouteCondition`

A template condition to copy matcher settings from.

#### Returns

`PatternsRouteCondition`

#### Overrides

`AbstractRouteCondition<PatternsRouteCondition>.constructor`

### Constructor

> **new PatternsRouteCondition**(`patterns`, `pathMatcher`, `useTrailingSlashMatch`, `fileExtensions`): `PatternsRouteCondition`

Create a condition with explicit matcher settings.

#### Parameters

##### patterns

`string`[]

Route patterns to use.

##### pathMatcher

`PathMatcher`

The matcher to use.

##### useTrailingSlashMatch

`boolean`

Whether to allow trailing slash matches.

##### fileExtensions

`string`[]

File extensions to treat as suffix patterns.

#### Returns

`PatternsRouteCondition`

#### Overrides

`AbstractRouteCondition<PatternsRouteCondition>.constructor`

## Properties

### fileExtensions

> **fileExtensions**: `string`[]

File extensions that are treated as matchable suffixes.

***

### pathMatcher

> `readonly` **pathMatcher**: `PathMatcher`

Matcher used to compare and merge route patterns.

***

### patterns

> **patterns**: `Set`\<`string`\>

Route patterns to match against.

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Whether a trailing slash may be treated as equivalent.

## Accessors

### content

#### Get Signature

> **get** **content**(): `string`[]

The condition's content parts.

##### Returns

`string`[]

The condition's constituent parts.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`content`](../../route-condition/classes/AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

The separator used when rendering.

##### Returns

`string`

The separator used when rendering the parts.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`infix`](../../route-condition/classes/AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`isEmpty`](../../route-condition/classes/AbstractRouteCondition.md#isempty)

## Methods

### compareTo()

> **compareTo**(`value`, `route`): `number`

Compare route patterns using the configured path matcher.

#### Parameters

##### value

`PatternsRouteCondition`

The condition to compare.

##### route

[`Route`](#)

The route used to obtain a pattern comparator.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`compareTo`](../../route-condition/classes/AbstractRouteCondition.md#compareto)

***

### equals()

> **equals**(`value`): `boolean`

Compare this condition to another value.

#### Parameters

##### value

`unknown`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`equals`](../../route-condition/classes/AbstractRouteCondition.md#equals)

***

### getMatchingPatterns()

> **getMatchingPatterns**(`path`): `string`[]

Return the patterns that match a path.

#### Parameters

##### path

`string`

The path to test.

#### Returns

`string`[]

The matching patterns, sorted when necessary.

***

### match()

> **match**(`route`): `PatternsRouteCondition` \| `null`

Return a condition containing only the patterns that match the route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`PatternsRouteCondition` \| `null`

A matching condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`match`](../../route-condition/classes/AbstractRouteCondition.md#match)

***

### merge()

> **merge**(`value`): `PatternsRouteCondition`

Merge route patterns from both conditions.

#### Parameters

##### value

`PatternsRouteCondition`

The condition to merge with.

#### Returns

`PatternsRouteCondition`

A new condition containing the merged patterns.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`merge`](../../route-condition/classes/AbstractRouteCondition.md#merge)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`toJSON`](../../route-condition/classes/AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`toString`](../../route-condition/classes/AbstractRouteCondition.md#tostring)
