[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / PatternsRouteCondition

# Class: PatternsRouteCondition

## Param

**patterns**

the route patterns to use; if 0, the condition will match to every route.

## Param

**pathMatcher**

## Param

**useTrailingSlashMatch**

whether to match irrespective of a trailing slash

## Param

**fileExtensions**

a list of file extensions to consider for path matching

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`PatternsRouteCondition`\>

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

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

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

##### Returns

`string`[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

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

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)

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

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `PatternsRouteCondition` \| `null`

Return a condition containing only the patterns that match the route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`PatternsRouteCondition` \| `null`

A matching condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

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

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)
